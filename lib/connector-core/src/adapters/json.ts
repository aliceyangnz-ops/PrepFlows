/**
 * JSON import adapter.
 *
 * Accepts a JSON string or parsed value and normalises it to an array of
 * RawEventRow objects.
 *
 * Handles:
 *  - Root array:         [{ ... }, { ... }]
 *  - Wrapped array:      { "events": [...] }, { "bookings": [...] }, etc.
 *  - Single object:      { "name": "...", ... }
 *  - Nested pagination:  { "data": { "items": [...] }, "total": N }
 */

import type { RawEventRow } from "../types.js";

export interface JsonAdapterOptions {
  /**
   * Dot-notation path to the array of records if the root is an object.
   * Auto-detected if not specified.
   */
  dataPath?: string;
  /** Maximum rows. 0 = unlimited. */
  maxRows?: number;
}

const KNOWN_ARRAY_KEYS = [
  "events", "bookings", "items", "records", "results",
  "data", "functions", "leads", "reservations", "orders",
];

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((curr, key) => {
    if (curr && typeof curr === "object" && !Array.isArray(curr)) {
      return (curr as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function extractRows(raw: unknown): RawEventRow[] {
  if (Array.isArray(raw)) return raw as RawEventRow[];
  if (!raw || typeof raw !== "object") return [];

  const obj = raw as Record<string, unknown>;

  // Try known wrapper keys
  for (const key of KNOWN_ARRAY_KEYS) {
    const v = obj[key];
    if (Array.isArray(v)) return v as RawEventRow[];
    // Nested: { data: { events: [...] } }
    if (v && typeof v === "object") {
      const nested = v as Record<string, unknown>;
      for (const nk of KNOWN_ARRAY_KEYS) {
        if (Array.isArray(nested[nk])) return nested[nk] as RawEventRow[];
      }
    }
  }

  // Fallback: treat root object as single record
  return [obj as RawEventRow];
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
  depth = 0,
): Record<string, unknown> {
  if (depth > 3) return { [prefix]: JSON.stringify(obj) };
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      Object.assign(result, flattenObject(v as Record<string, unknown>, key, depth + 1));
    } else if (Array.isArray(v) && v.length > 0 && typeof v[0] !== "object") {
      result[key] = v.join("; ");
    } else if (v instanceof Date) {
      result[key] = v.toISOString().slice(0, 10);
    } else {
      result[key] = v;
    }
  }
  return result;
}

export function parseJson(
  input: string | unknown,
  options: JsonAdapterOptions = {},
): RawEventRow[] {
  let parsed: unknown;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch (e) {
      throw new Error(`JSON parse error: ${(e as Error).message}`);
    }
  } else {
    parsed = input;
  }

  let rows: RawEventRow[];
  if (options.dataPath) {
    const resolved = resolvePath(parsed, options.dataPath);
    rows = Array.isArray(resolved) ? (resolved as RawEventRow[]) : [resolved as RawEventRow];
  } else {
    rows = extractRows(parsed);
  }

  if (options.maxRows && options.maxRows > 0) {
    rows = rows.slice(0, options.maxRows);
  }

  // Flatten any nested objects so the mapping engine can access fields
  return rows.map((r) =>
    typeof r === "object" && r !== null && !Array.isArray(r)
      ? flattenObject(r as Record<string, unknown>)
      : { value: String(r) },
  );
}
