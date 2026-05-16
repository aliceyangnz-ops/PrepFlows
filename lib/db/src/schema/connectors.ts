/**
 * Database schema for the Universal Banquet Connector system.
 *
 * Tables:
 *  connector_configs   — one row per configured PMS integration
 *  sync_records        — audit log of every sync run
 *  webhook_events      — raw incoming webhook payloads (before processing)
 *  normalized_events   — connector-normalised function records awaiting merge
 *  mapping_rules       — per-connector field-mapping configuration
 */

import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const connectorSourceEnum = pgEnum("connector_source", [
  "moments",
  "delphi",
  "opera",
  "ivvy",
  "tripleseat",
  "priava",
]);

export const connectorStatusEnum = pgEnum("connector_status", [
  "active",
  "paused",
  "error",
  "unconfigured",
]);

export const syncTriggerEnum = pgEnum("sync_trigger", [
  "manual",
  "scheduled",
  "webhook",
  "file_import",
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "running",
  "completed",
  "failed",
  "partial",
]);

// ── connector_configs ─────────────────────────────────────────────────────────

export const connectorConfigsTable = pgTable("connector_configs", {
  id:              uuid("id").primaryKey().defaultRandom(),
  name:            text("name").notNull(),
  source:          connectorSourceEnum("source").notNull(),
  status:          connectorStatusEnum("status").notNull().default("unconfigured"),
  apiEndpoint:     text("api_endpoint"),
  /** Stored encrypted — never returned to the frontend */
  apiKeyEncrypted: text("api_key_encrypted"),
  webhookSecret:   text("webhook_secret"),
  webhookPath:     text("webhook_path").notNull().default(""),
  schedule:        text("schedule"),
  lastSyncAt:      timestamp("last_sync_at"),
  lastSyncStatus:  syncStatusEnum("last_sync_status"),
  lastSyncError:   text("last_sync_error"),
  // Workspace / auth columns — nullable until multi-tenancy is enabled
  workspaceId:     uuid("workspace_id"),
  createdBy:       uuid("created_by"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
});

// ── sync_records ──────────────────────────────────────────────────────────────

export const syncRecordsTable = pgTable("sync_records", {
  id:                 uuid("id").primaryKey().defaultRandom(),
  connectorConfigId:  uuid("connector_config_id").notNull(),
  connectorName:      text("connector_name").notNull().default(""),
  source:             connectorSourceEnum("source").notNull(),
  trigger:            syncTriggerEnum("trigger").notNull(),
  status:             syncStatusEnum("status").notNull().default("running"),
  eventsProcessed:    integer("events_processed").notNull().default(0),
  eventsCreated:      integer("events_created").notNull().default(0),
  eventsUpdated:      integer("events_updated").notNull().default(0),
  eventsSkipped:      integer("events_skipped").notNull().default(0),
  errors:             jsonb("errors")
                        .$type<Array<{ row?: number; field?: string; message: string; severity: string }>>()
                        .notNull()
                        .default([]),
  startedAt:          timestamp("started_at").notNull().defaultNow(),
  completedAt:        timestamp("completed_at"),
  durationMs:         integer("duration_ms"),
  workspaceId:        uuid("workspace_id"),
});

// ── webhook_events ────────────────────────────────────────────────────────────

export const webhookEventsTable = pgTable("webhook_events", {
  id:                uuid("id").primaryKey().defaultRandom(),
  connectorConfigId: text("connector_config_id").notNull(),
  source:            connectorSourceEnum("source").notNull(),
  payload:           jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  headers:           jsonb("headers").$type<Record<string, string>>().notNull().default({}),
  processed:         boolean("processed").notNull().default(false),
  error:             text("error"),
  receivedAt:        timestamp("received_at").notNull().defaultNow(),
  processedAt:       timestamp("processed_at"),
  workspaceId:       uuid("workspace_id"),
});

// ── normalized_events ─────────────────────────────────────────────────────────
// Connector-normalised function records that have been extracted from the source
// system but not yet merged into kitchen_functions.

export const normalizedEventsTable = pgTable("normalized_events", {
  id:                uuid("id").primaryKey().defaultRandom(),
  connectorConfigId: uuid("connector_config_id").notNull(),
  source:            connectorSourceEnum("source").notNull(),
  sourceEventId:     text("source_event_id").notNull(),
  payload:           jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  status:            text("status").notNull().default("pending"), // pending | merged | skipped | error
  mappedAt:          timestamp("mapped_at").notNull().defaultNow(),
  mergedAt:          timestamp("merged_at"),
  workspaceId:       uuid("workspace_id"),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
});

// ── mapping_rules ─────────────────────────────────────────────────────────────
// Per-connector field-mapping configuration.

export const mappingRulesTable = pgTable("mapping_rules", {
  id:                uuid("id").primaryKey().defaultRandom(),
  connectorConfigId: uuid("connector_config_id").notNull(),
  sourceField:       text("source_field").notNull(),
  targetField:       text("target_field").notNull(),
  transform:         text("transform"), // jsonpath expression or named transform
  priority:          integer("priority").notNull().default(0),
  active:            boolean("active").notNull().default(true),
  workspaceId:       uuid("workspace_id"),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
  updatedAt:         timestamp("updated_at").notNull().defaultNow(),
});

// ── Zod schemas + inferred types ──────────────────────────────────────────────

export const insertConnectorConfigSchema = createInsertSchema(connectorConfigsTable);
export const selectConnectorConfigSchema = createSelectSchema(connectorConfigsTable);
export type ConnectorConfigRow    = typeof connectorConfigsTable.$inferSelect;
export type InsertConnectorConfigRow = typeof connectorConfigsTable.$inferInsert;

export const insertSyncRecordSchema = createInsertSchema(syncRecordsTable);
export const selectSyncRecordSchema = createSelectSchema(syncRecordsTable);
export type SyncRecordRow    = typeof syncRecordsTable.$inferSelect;
export type InsertSyncRecordRow = typeof syncRecordsTable.$inferInsert;

export const insertWebhookEventSchema = createInsertSchema(webhookEventsTable);
export const selectWebhookEventSchema = createSelectSchema(webhookEventsTable);
export type WebhookEventRow    = typeof webhookEventsTable.$inferSelect;
export type InsertWebhookEventRow = typeof webhookEventsTable.$inferInsert;

export const insertNormalizedEventSchema = createInsertSchema(normalizedEventsTable);
export const selectNormalizedEventSchema = createSelectSchema(normalizedEventsTable);
export type NormalizedEventRow = typeof normalizedEventsTable.$inferSelect;
export type InsertNormalizedEventRow = typeof normalizedEventsTable.$inferInsert;

export const insertMappingRuleSchema = createInsertSchema(mappingRulesTable);
export const selectMappingRuleSchema = createSelectSchema(mappingRulesTable);
export type MappingRuleRow = typeof mappingRulesTable.$inferSelect;
export type InsertMappingRuleRow = typeof mappingRulesTable.$inferInsert;
