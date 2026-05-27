/**
 * @workspace/connector-core
 * Universal Banquet Connector — public API surface.
 */

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  ConnectorSource,
  ConnectorStatus,
  SyncTrigger,
  SyncStatus,
  AdapterType,
  SyncEventType,
  ConnectorConfig,
  SyncError,
  SyncRecord,
  WebhookEvent,
  RawEventRow,
  UnifiedDietaryRequirement,
  UnifiedBanquetEvent,
  ConnectorFieldMap,
  SyncProgressEvent,
} from "./types.js";

export { CONNECTOR_SOURCES, CONNECTOR_DISPLAY_NAMES } from "./types.js";

// ── Base connector ────────────────────────────────────────────────────────────
export { BaseConnector } from "./connectors/base.js";
export type { WebhookParseResult } from "./connectors/base.js";

// ── Connector implementations ─────────────────────────────────────────────────
export { MomentsConnector, momentsConnector } from "./connectors/moments.js";
export { DelphiConnector, delphiConnector } from "./connectors/delphi.js";
export { OperaConnector, operaConnector } from "./connectors/opera.js";
export { IvvyConnector, ivvyConnector } from "./connectors/ivvy.js";
export {
  TripleseatConnector,
  tripleseatConnector,
} from "./connectors/tripleseat.js";
export { PriavaConnector, priavaConnector } from "./connectors/priava.js";

// ── Connector registry ────────────────────────────────────────────────────────
import { momentsConnector } from "./connectors/moments.js";
import { delphiConnector } from "./connectors/delphi.js";
import { operaConnector } from "./connectors/opera.js";
import { ivvyConnector } from "./connectors/ivvy.js";
import { tripleseatConnector } from "./connectors/tripleseat.js";
import { priavaConnector } from "./connectors/priava.js";
import type { ConnectorSource } from "./types.js";
import { BaseConnector } from "./connectors/base.js";

export const CONNECTOR_REGISTRY = {
  moments: momentsConnector,
  delphi: delphiConnector,
  opera: operaConnector,
  ivvy: ivvyConnector,
  tripleseat: tripleseatConnector,
  priava: priavaConnector,
} satisfies Record<ConnectorSource, BaseConnector>;

export function getConnector(source: ConnectorSource): BaseConnector {
  return CONNECTOR_REGISTRY[source];
}

// ── Adapters ──────────────────────────────────────────────────────────────────
export { parseCsv } from "./adapters/csv.js";
export { parseXlsx } from "./adapters/xlsx.js";
export { parseJson } from "./adapters/json.js";
export { parseApiPayload, extractPaginationInfo } from "./adapters/api.js";
export type { CsvAdapterOptions } from "./adapters/csv.js";
export type { XlsxAdapterOptions } from "./adapters/xlsx.js";
export type { JsonAdapterOptions } from "./adapters/json.js";
export type { ApiPayloadOptions, PaginationInfo } from "./adapters/api.js";

// ── Mapping engine ────────────────────────────────────────────────────────────
export {
  mapRowToMappedRaw,
  normalizeToUnifiedEvent,
  processRow,
} from "./mapping/engine.js";
export type { MappedRaw } from "./mapping/engine.js";

// ── Normalization service ─────────────────────────────────────────────────────
export {
  normalizeDate,
  normalizeTime,
  normalizeGuestCount,
  normalizeEventType,
  parseDietaryRequirements,
  normalizeRoomName,
  normalizeRevenue,
  hashRow,
} from "./normalization/service.js";
