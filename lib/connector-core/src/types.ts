/**
 * Universal Banquet Connector — core type definitions.
 *
 * This file defines:
 *  - ConnectorSource   — the six supported PMS systems
 *  - ConnectorConfig   — stored connector instance configuration
 *  - SyncRecord        — one sync-run audit entry
 *  - WebhookEvent      — incoming webhook log entry
 *  - UnifiedBanquetEvent — the canonical normalized event schema
 *  - ConnectorFieldMap — connector-specific field alias declarations
 *  - SyncProgressEvent — SSE event for the real-time dashboard
 */

// ── Source systems ────────────────────────────────────────────────────────────

export type ConnectorSource =
  | "moments"
  | "delphi"
  | "opera"
  | "ivvy"
  | "tripleseat"
  | "priava";

export const CONNECTOR_SOURCES: ConnectorSource[] = [
  "moments",
  "delphi",
  "opera",
  "ivvy",
  "tripleseat",
  "priava",
];

export const CONNECTOR_DISPLAY_NAMES: Record<ConnectorSource, string> = {
  moments: "Moments (Ungerboeck)",
  delphi: "Delphi (Amadeus S&C)",
  opera: "Oracle Opera",
  ivvy: "iVvy",
  tripleseat: "Tripleseat",
  priava: "Priava",
};

// ── Status / trigger enums ────────────────────────────────────────────────────

export type ConnectorStatus = "active" | "paused" | "error" | "unconfigured";
export type SyncTrigger = "manual" | "scheduled" | "webhook" | "file_import";
export type SyncStatus = "running" | "completed" | "failed" | "partial";
export type AdapterType = "xlsx" | "csv" | "json" | "api";
export type SyncEventType =
  | "sync_started"
  | "sync_progress"
  | "sync_completed"
  | "sync_failed"
  | "webhook_received";

// ── Configuration ─────────────────────────────────────────────────────────────

export interface ConnectorConfig {
  id: string;
  name: string;
  source: ConnectorSource;
  status: ConnectorStatus;
  /** Base URL of the PMS API, e.g. https://api.ivvy.com/v1 */
  apiEndpoint?: string;
  /** API key or token — stored encrypted in DB, never returned to frontend */
  apiKey?: string;
  /** HMAC secret used to verify incoming webhook signatures */
  webhookSecret?: string;
  /** URL path that accepts POST webhooks for this connector instance */
  webhookPath: string;
  /** Optional cron expression for scheduled pull syncs e.g. every 6 hours */
  schedule?: string;
  lastSyncAt?: string;
  lastSyncStatus?: SyncStatus;
  lastSyncError?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Sync records ──────────────────────────────────────────────────────────────

export interface SyncError {
  row?: number;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

export interface SyncRecord {
  id: string;
  connectorConfigId: string;
  connectorName: string;
  source: ConnectorSource;
  trigger: SyncTrigger;
  status: SyncStatus;
  eventsProcessed: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsSkipped: number;
  errors: SyncError[];
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

// ── Webhook event log ─────────────────────────────────────────────────────────

export interface WebhookEvent {
  id: string;
  connectorConfigId: string;
  source: ConnectorSource;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  processed: boolean;
  error?: string;
  receivedAt: string;
  processedAt?: string;
}

// ── Raw rows (from any adapter) ───────────────────────────────────────────────

/** A single row from any import adapter — keys are raw field names. */
export type RawEventRow = Record<string, unknown>;

// ── Unified Banquet Event ─────────────────────────────────────────────────────

export interface UnifiedDietaryRequirement {
  name: string;
  count: number;
  note?: string;
}

/**
 * The canonical normalized representation of an event from any PMS.
 * This schema is a superset of KitchenCommand's KitchenFunction.
 */
export interface UnifiedBanquetEvent {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: string;
  externalId: string; // original PMS record ID
  source: ConnectorSource;
  connectorConfigId: string;

  // ── Core scheduling ───────────────────────────────────────────────────────
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)

  // ── Venue ─────────────────────────────────────────────────────────────────
  venue: string;
  room: string;
  floor: string;

  // ── Guest numbers ─────────────────────────────────────────────────────────
  guestCount: number;
  confirmedCount?: number;
  minimumGuarantee?: number;

  // ── Client ────────────────────────────────────────────────────────────────
  bookedBy: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // ── Classification ────────────────────────────────────────────────────────
  eventType: string; // normalized to KitchenCommand FunctionType where possible
  status: string;

  // ── Content ───────────────────────────────────────────────────────────────
  menu: string[];
  dietaryRequirements: UnifiedDietaryRequirement[];
  notes: string;

  // ── Financial ─────────────────────────────────────────────────────────────
  estimatedRevenue?: number;
  depositAmount?: number;
  depositPaid?: boolean;

  // ── Staff ─────────────────────────────────────────────────────────────────
  chefInCharge?: string;
  eventManager?: string;

  // ── Metadata ──────────────────────────────────────────────────────────────
  sourceRaw: Record<string, unknown>; // the original raw row
  importedAt: string; // ISO timestamp
  lastSyncedAt: string;
  contentHash: string; // SHA-256 of source data for change detection
}

// ── Field map ─────────────────────────────────────────────────────────────────

/**
 * Declares which raw field names (from the source system) correspond to each
 * canonical field in UnifiedBanquetEvent.
 *
 * Aliases are tried in order; the first non-empty match wins.
 * Case-insensitive matching is applied by the mapping engine.
 */
export interface ConnectorFieldMap {
  name: string[];
  date: string[];
  startTime: string[];
  endTime: string[];
  venue: string[];
  room: string[];
  floor: string[];
  guestCount: string[];
  confirmedCount: string[];
  bookedBy: string[];
  contactName: string[];
  contactEmail: string[];
  contactPhone: string[];
  eventType: string[];
  status: string[];
  menu: string[];
  dietaryNotes: string[];
  notes: string[];
  chefInCharge: string[];
  eventManager: string[];
  externalId: string[];
  revenue: string[];
}

// ── SSE / real-time events ────────────────────────────────────────────────────

export interface SyncProgressEvent {
  type: SyncEventType;
  syncRecordId?: string;
  connectorConfigId?: string;
  connectorName?: string;
  source?: ConnectorSource;
  message: string;
  data?: Partial<SyncRecord>;
  timestamp: string;
}
