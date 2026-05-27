/**
 * Sync Engine — orchestrates connector sync runs and publishes real-time
 * SSE events to connected dashboard clients.
 *
 * Responsibilities:
 *  - Manages the pool of SSE subscriber Response objects
 *  - Creates and updates sync_records in the database
 *  - Routes RawEventRows through the mapping + normalization pipeline
 *  - Upserts normalized events into kitchen_functions
 *  - Logs webhook events before processing
 */

import type { Response } from "express";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  syncRecordsTable,
  webhookEventsTable,
  connectorConfigsTable,
  kitchenFunctionsTable,
  type InsertSyncRecordRow,
  type InsertKitchenFunctionRow,
} from "@workspace/db";
import {
  getConnector,
  mapRowToMappedRaw,
  normalizeToUnifiedEvent,
  type ConnectorSource,
  type SyncTrigger,
  type RawEventRow,
  type SyncProgressEvent,
  type SyncError,
} from "@workspace/connector-core";
import { logger } from "../lib/logger.js";

// ── SSE subscriber pool ───────────────────────────────────────────────────────

const subscribers = new Set<Response>();

export function addSseSubscriber(res: Response): void {
  subscribers.add(res);
  res.on("close", () => subscribers.delete(res));
}

export function broadcastSseEvent(event: SyncProgressEvent): void {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of subscribers) {
    try {
      res.write(data);
    } catch {
      subscribers.delete(res);
    }
  }
}

// ── Sync record lifecycle ─────────────────────────────────────────────────────

async function createSyncRecord(params: {
  connectorConfigId: string;
  connectorName: string;
  source: ConnectorSource;
  trigger: SyncTrigger;
}): Promise<string> {
  const id = randomUUID();
  await db.insert(syncRecordsTable).values({
    id,
    connectorConfigId: params.connectorConfigId,
    connectorName: params.connectorName,
    source: params.source as InsertSyncRecordRow["source"],
    trigger: params.trigger as InsertSyncRecordRow["trigger"],
    status: "running",
    eventsProcessed: 0,
    eventsCreated: 0,
    eventsUpdated: 0,
    eventsSkipped: 0,
    errors: [],
  });
  return id;
}

async function completeSyncRecord(
  id: string,
  counts: {
    processed: number;
    created: number;
    updated: number;
    skipped: number;
  },
  errors: SyncError[],
  startedAt: Date,
): Promise<void> {
  const completedAt = new Date();
  await db
    .update(syncRecordsTable)
    .set({
      status: errors.some((e) => e.severity === "error")
        ? "partial"
        : "completed",
      eventsProcessed: counts.processed,
      eventsCreated: counts.created,
      eventsUpdated: counts.updated,
      eventsSkipped: counts.skipped,
      errors: errors as InsertSyncRecordRow["errors"],
      completedAt,
      durationMs: completedAt.getTime() - startedAt.getTime(),
    })
    .where(eq(syncRecordsTable.id, id));
}

async function failSyncRecord(
  id: string,
  message: string,
  startedAt: Date,
): Promise<void> {
  const completedAt = new Date();
  await db
    .update(syncRecordsTable)
    .set({
      status: "failed",
      errors: [{ message, severity: "error" }] as InsertSyncRecordRow["errors"],
      completedAt,
      durationMs: completedAt.getTime() - startedAt.getTime(),
    })
    .where(eq(syncRecordsTable.id, id));
}

// ── Core sync function ────────────────────────────────────────────────────────

export async function runSync(params: {
  connectorConfigId: string;
  rows: RawEventRow[];
  trigger: SyncTrigger;
}): Promise<{
  syncRecordId: string;
  created: number;
  updated: number;
  skipped: number;
  errors: SyncError[];
}> {
  const { connectorConfigId, rows, trigger } = params;
  const startedAt = new Date();

  // Load connector config
  const [config] = await db
    .select()
    .from(connectorConfigsTable)
    .where(eq(connectorConfigsTable.id, connectorConfigId))
    .limit(1);

  if (!config) {
    throw new Error(`Connector config not found: ${connectorConfigId}`);
  }

  const connector = getConnector(config.source as ConnectorSource);
  const syncRecordId = await createSyncRecord({
    connectorConfigId,
    connectorName: config.name,
    source: config.source as ConnectorSource,
    trigger,
  });

  broadcastSseEvent({
    type: "sync_started",
    syncRecordId,
    connectorConfigId,
    connectorName: config.name,
    source: config.source as ConnectorSource,
    message: `Starting sync of ${rows.length} rows from ${connector.displayName}`,
    timestamp: new Date().toISOString(),
  });

  const errors: SyncError[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    try {
      const raw = connector.transformRow(rows[i]!);
      const mapped = mapRowToMappedRaw(raw, connector.getFieldMap());
      const unified = normalizeToUnifiedEvent(
        raw,
        mapped,
        config.source as ConnectorSource,
        connectorConfigId,
      );

      // Skip rows with no name or date
      if (!unified.name || unified.name === "Unnamed Event" || !unified.date) {
        skipped++;
        continue;
      }

      // Check for existing record by externalId + source
      const existing = await db
        .select({ id: kitchenFunctionsTable.id })
        .from(kitchenFunctionsTable)
        .where(eq(kitchenFunctionsTable.sourceSystem, config.source))
        .limit(100);

      // Simple upsert by externalId embedded in importJobId field
      const existingByExtId = existing.find(() => false); // TODO: externalId column

      if (existingByExtId) {
        await db
          .update(kitchenFunctionsTable)
          .set({
            name: unified.name,
            room: unified.room,
            floor: unified.floor,
            date: unified.date,
            startTime: unified.startTime,
            endTime: unified.endTime,
            guestCount: unified.guestCount,
            menu: unified.menu,
            dietaryRequirements: unified.dietaryRequirements,
            updatedAt: new Date(),
          })
          .where(eq(kitchenFunctionsTable.id, existingByExtId.id));
        updated++;
      } else {
        const insertRow: InsertKitchenFunctionRow = {
          id: unified.id,
          name: unified.name,
          room: unified.room,
          floor: unified.floor,
          date: unified.date,
          startTime: unified.startTime,
          endTime: unified.endTime,
          guestCount: unified.guestCount,
          status: "upcoming",
          menu: unified.menu,
          dietaryRequirements: unified.dietaryRequirements,
          teamIds: [],
          timeline: [],
          sourceSystem: config.source,
          importJobId: unified.externalId,
        };
        await db.insert(kitchenFunctionsTable).values(insertRow);
        created++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ row: i + 1, message, severity: "error" });
      logger.error({ err, row: i }, "sync row error");
    }

    // Broadcast progress every 10 rows
    if ((i + 1) % 10 === 0) {
      broadcastSseEvent({
        type: "sync_progress",
        syncRecordId,
        connectorConfigId,
        connectorName: config.name,
        source: config.source as ConnectorSource,
        message: `Processed ${i + 1}/${rows.length} rows`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  await completeSyncRecord(
    syncRecordId,
    { processed: rows.length, created, updated, skipped },
    errors,
    startedAt,
  );

  // Update connector's lastSyncAt
  await db
    .update(connectorConfigsTable)
    .set({
      lastSyncAt: new Date(),
      lastSyncStatus: errors.some((e) => e.severity === "error")
        ? "partial"
        : "completed",
      lastSyncError: errors[0]?.message ?? null,
      updatedAt: new Date(),
    })
    .where(eq(connectorConfigsTable.id, connectorConfigId));

  broadcastSseEvent({
    type: "sync_completed",
    syncRecordId,
    connectorConfigId,
    connectorName: config.name,
    source: config.source as ConnectorSource,
    message: `Sync complete: ${created} created, ${updated} updated, ${skipped} skipped, ${errors.length} errors`,
    data: {
      id: syncRecordId,
      eventsCreated: created,
      eventsUpdated: updated,
      eventsSkipped: skipped,
      errors,
    },
    timestamp: new Date().toISOString(),
  });

  return { syncRecordId, created, updated, skipped, errors };
}

// ── Webhook event logging ─────────────────────────────────────────────────────

export async function logWebhookEvent(params: {
  connectorConfigId: string;
  source: ConnectorSource;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
}): Promise<string> {
  const id = randomUUID();
  await db.insert(webhookEventsTable).values({
    id,
    connectorConfigId: params.connectorConfigId,
    source: params.source as InsertSyncRecordRow["source"],
    payload: params.payload,
    headers: params.headers,
    processed: false,
  });
  return id;
}

export async function markWebhookProcessed(
  id: string,
  error?: string,
): Promise<void> {
  await db
    .update(webhookEventsTable)
    .set({ processed: true, processedAt: new Date(), error: error ?? null })
    .where(eq(webhookEventsTable.id, id));
}
