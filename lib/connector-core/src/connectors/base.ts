/**
 * BaseConnector — abstract base class for all PMS connector implementations.
 *
 * Each connector must declare:
 *  - source       — the ConnectorSource identifier
 *  - fieldMap     — alias declarations for field mapping
 *  - displayName  — human-readable name
 *
 * And optionally override:
 *  - verifyWebhookSignature  — HMAC verification (default: false)
 *  - parseWebhookPayload     — extract RawEventRow[] from webhook body
 *  - transformRow            — any connector-specific pre-mapping transforms
 */

import type {
  ConnectorSource,
  ConnectorFieldMap,
  RawEventRow,
  SyncError,
} from "../types.js";

export interface WebhookParseResult {
  rows: RawEventRow[];
  errors: SyncError[];
}

export abstract class BaseConnector {
  abstract readonly source: ConnectorSource;
  abstract readonly displayName: string;
  abstract readonly fieldMap: ConnectorFieldMap;

  /** Header name carrying the webhook signature, e.g. "x-moments-signature" */
  readonly webhookSignatureHeader?: string;

  /**
   * Verify an incoming webhook signature.
   * @param rawBody   - the raw request body string
   * @param signature - the value from webhookSignatureHeader
   * @param secret    - the configured webhook secret
   */
  verifyWebhookSignature(
    _rawBody: string,
    _signature: string,
    _secret: string,
  ): boolean {
    return false; // override in concrete connectors that support HMAC
  }

  /**
   * Parse an incoming webhook POST body into raw event rows.
   * Return null if the payload cannot be recognised.
   */
  parseWebhookPayload(
    _headers: Record<string, string>,
    _body: unknown,
  ): WebhookParseResult | null {
    return null;
  }

  /**
   * Optional per-connector row transformation applied BEFORE the mapping
   * engine processes the row.  Default: identity.
   */
  transformRow(row: RawEventRow): RawEventRow {
    return row;
  }

  getFieldMap(): ConnectorFieldMap {
    return this.fieldMap;
  }
}
