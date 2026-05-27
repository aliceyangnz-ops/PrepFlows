/**
 * API payload adapter.
 *
 * Handles structured API responses from PMS systems where data has already
 * been fetched from a REST endpoint.  The adapter normalises pagination
 * envelopes and converts connector-specific type names before handing off
 * to the mapping engine.
 *
 * This is a thin wrapper — the heavy lifting happens in the mapping engine.
 * It is called when data arrives as a parsed JavaScript object (e.g. from
 * an axios/fetch response) rather than as a raw file.
 */

import type { RawEventRow, ConnectorSource } from "../types.js";
import { parseJson } from "./json.js";

export interface ApiPayloadOptions {
  /** Which PMS system this response came from */
  source: ConnectorSource;
  /** Dot-path to the data array within the response object */
  dataPath?: string;
  /** Max rows */
  maxRows?: number;
}

/** Connector-specific envelope unwrappers */
const SOURCE_DATA_PATHS: Record<ConnectorSource, string[]> = {
  moments: ["Events", "events", "data.events", "data"],
  delphi: ["records", "data.records", "bookings", "data"],
  opera: ["hotelEventDetail", "events", "data.events", "reservationInfoList"],
  ivvy: ["results", "bookings", "data.results", "data"],
  tripleseat: ["leads", "bookings", "data", "results"],
  priava: ["Events", "Bookings", "data.Events", "data"],
};

function tryPaths(obj: unknown, paths: string[]): unknown[] | null {
  for (const path of paths) {
    const segments = path.split(".");
    let curr: unknown = obj;
    for (const seg of segments) {
      if (curr && typeof curr === "object" && !Array.isArray(curr)) {
        curr = (curr as Record<string, unknown>)[seg];
      } else {
        curr = undefined;
        break;
      }
    }
    if (Array.isArray(curr) && curr.length > 0) return curr as unknown[];
  }
  return null;
}

export function parseApiPayload(
  payload: unknown,
  options: ApiPayloadOptions,
): RawEventRow[] {
  // 1. If caller provides an explicit data path, use JSON adapter
  if (options.dataPath) {
    return parseJson(payload, {
      dataPath: options.dataPath,
      maxRows: options.maxRows,
    });
  }

  // 2. Try connector-specific known paths
  const sourcePaths = SOURCE_DATA_PATHS[options.source] ?? [];
  const found = tryPaths(payload, sourcePaths);
  if (found) {
    const rows = options.maxRows ? found.slice(0, options.maxRows) : found;
    return parseJson(rows);
  }

  // 3. Fall back to generic JSON extraction
  return parseJson(payload, { maxRows: options.maxRows });
}

// ── Pagination helpers ────────────────────────────────────────────────────────

export interface PaginationInfo {
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore: boolean;
  nextPage?: number;
  nextCursor?: string;
}

const TOTAL_KEYS = [
  "total",
  "totalCount",
  "total_count",
  "totalRecords",
  "count",
];
const PAGE_KEYS = ["page", "currentPage", "pageNumber"];
const SIZE_KEYS = ["pageSize", "page_size", "limit", "perPage", "per_page"];
const CURSOR_KEYS = [
  "nextCursor",
  "next_cursor",
  "cursor",
  "nextPage",
  "next_page_token",
];

function findKey(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) if (k in obj) return obj[k];
  return undefined;
}

export function extractPaginationInfo(response: unknown): PaginationInfo {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return { hasMore: false };
  }
  const obj = response as Record<string, unknown>;
  const total = Number(findKey(obj, TOTAL_KEYS)) || undefined;
  const page = Number(findKey(obj, PAGE_KEYS)) || undefined;
  const pageSize = Number(findKey(obj, SIZE_KEYS)) || undefined;
  const cursor = findKey(obj, CURSOR_KEYS);

  let hasMore = false;
  if (cursor && typeof cursor === "string") hasMore = true;
  if (total && page && pageSize) hasMore = page * pageSize < total;
  if (typeof cursor === "number" && cursor > 0) hasMore = true;

  return {
    total,
    page,
    pageSize,
    hasMore,
    nextPage: typeof cursor === "number" ? cursor : page ? page + 1 : undefined,
    nextCursor: typeof cursor === "string" ? cursor : undefined,
  };
}
