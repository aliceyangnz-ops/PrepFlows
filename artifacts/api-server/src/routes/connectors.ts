/**
 * /api/connectors — CRUD for connector configurations.
 *
 * GET    /api/connectors           — list all
 * POST   /api/connectors           — create
 * GET    /api/connectors/:id       — get one
 * PATCH  /api/connectors/:id       — update
 * DELETE /api/connectors/:id       — delete
 *
 * NOTE: apiKey is write-only — it is never returned to the client.
 */

import { Router } from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, connectorConfigsTable } from "@workspace/db";
import { CONNECTOR_SOURCES, CONNECTOR_DISPLAY_NAMES } from "@workspace/connector-core";

const router = Router();

// ── List all connectors ───────────────────────────────────────────────────────

router.get("/connectors", async (req, res) => {
  try {
    const rows = await db.select().from(connectorConfigsTable).orderBy(connectorConfigsTable.createdAt);
    // Strip API key
    const safe = rows.map(({ apiKeyEncrypted: _, ...r }) => r);
    res.json({ connectors: safe });
  } catch (err) {
    req.log.error({ err }, "list connectors failed");
    res.status(500).json({ error: "Failed to list connectors" });
  }
});

// ── Get available source types ────────────────────────────────────────────────

router.get("/connectors/sources", (_req, res) => {
  res.json({
    sources: CONNECTOR_SOURCES.map((source) => ({
      source,
      displayName: CONNECTOR_DISPLAY_NAMES[source],
    })),
  });
});

// ── Get one connector ─────────────────────────────────────────────────────────

router.get("/connectors/:id", async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(connectorConfigsTable)
      .where(eq(connectorConfigsTable.id, req.params.id!))
      .limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    const { apiKeyEncrypted: _, ...safe } = row;
    return res.json({ connector: safe });
  } catch (err) {
    req.log.error({ err }, "get connector failed");
    return res.status(500).json({ error: "Failed to get connector" });
  }
});

// ── Create connector ──────────────────────────────────────────────────────────

router.post("/connectors", async (req, res) => {
  const { name, source, apiEndpoint, apiKey, webhookSecret, schedule } = req.body as Record<string, string>;

  if (!name || !source) {
    return res.status(400).json({ error: "name and source are required" });
  }
  if (!CONNECTOR_SOURCES.includes(source as never)) {
    return res.status(400).json({ error: `Invalid source. Must be one of: ${CONNECTOR_SOURCES.join(", ")}` });
  }

  try {
    const id = randomUUID();
    const webhookPath = `/api/webhooks/${source}/${id.slice(0, 8)}`;

    const [created] = await db
      .insert(connectorConfigsTable)
      .values({
        id,
        name,
        source: source as never,
        status: "unconfigured",
        apiEndpoint:     apiEndpoint   || null,
        apiKeyEncrypted: apiKey        || null,
        webhookSecret:   webhookSecret || null,
        webhookPath,
        schedule: schedule || null,
      })
      .returning();

    const { apiKeyEncrypted: _, ...safe } = created!;
    return res.status(201).json({ connector: safe });
  } catch (err) {
    req.log.error({ err }, "create connector failed");
    return res.status(500).json({ error: "Failed to create connector" });
  }
});

// ── Update connector ──────────────────────────────────────────────────────────

router.patch("/connectors/:id", async (req, res) => {
  const updates = req.body as Record<string, unknown>;
  const allowed = ["name", "status", "apiEndpoint", "apiKey", "webhookSecret", "schedule"];

  try {
    const setValues: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (key in updates) {
        const dbKey = key === "apiKey" ? "apiKeyEncrypted" : key;
        setValues[dbKey] = updates[key] ?? null;
      }
    }

    // Auto-promote to active if API key or endpoint is provided
    if (updates["apiKey"] || updates["apiEndpoint"]) {
      setValues["status"] = "active";
    }

    const [updated] = await db
      .update(connectorConfigsTable)
      .set(setValues as never)
      .where(eq(connectorConfigsTable.id, req.params.id!))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    const { apiKeyEncrypted: _, ...safe } = updated;
    return res.json({ connector: safe });
  } catch (err) {
    req.log.error({ err }, "update connector failed");
    return res.status(500).json({ error: "Failed to update connector" });
  }
});

// ── Delete connector ──────────────────────────────────────────────────────────

router.delete("/connectors/:id", async (req, res) => {
  try {
    const result = await db
      .delete(connectorConfigsTable)
      .where(eq(connectorConfigsTable.id, req.params.id!))
      .returning({ id: connectorConfigsTable.id });

    if (result.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json({ deleted: true });
  } catch (err) {
    req.log.error({ err }, "delete connector failed");
    return res.status(500).json({ error: "Failed to delete connector" });
  }
});

export default router;
