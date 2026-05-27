/**
 * Mapping engine — transforms a RawEventRow into a MappedRaw by applying
 * a ConnectorFieldMap, then normalizes to UnifiedBanquetEvent.
 *
 * Resolution order per canonical field:
 *  1. Exact case-insensitive key match against the alias list
 *  2. Partial substring match (alias is contained in the raw key)
 *  3. Levenshtein distance ≤ 2 fuzzy match (aliases ≥ 4 chars only)
 */

import { randomUUID } from "node:crypto";
import type {
  RawEventRow,
  ConnectorFieldMap,
  ConnectorSource,
  UnifiedBanquetEvent,
} from "../types.js";
import {
  normalizeDate,
  normalizeTime,
  normalizeGuestCount,
  normalizeEventType,
  parseDietaryRequirements,
  normalizeRoomName,
  normalizeRevenue,
  hashRow,
} from "../normalization/service.js";

// ── Intermediate representation after mapping, before normalization ───────────

export type MappedRaw = Partial<Record<keyof ConnectorFieldMap, string>>;

// ── Levenshtein distance ──────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
    }
  }
  return dp[m]![n]!;
}

// ── Core field resolver ───────────────────────────────────────────────────────

function resolveField(row: RawEventRow, aliases: string[]): string | undefined {
  const rawKeys = Object.keys(row);
  const rawLower = rawKeys.map((k) => k.toLowerCase());

  for (const alias of aliases) {
    const al = alias.toLowerCase();

    // 1. Exact match
    const exactIdx = rawLower.indexOf(al);
    if (exactIdx !== -1) {
      const val = row[rawKeys[exactIdx]!];
      if (val !== undefined && val !== null && val !== "") return String(val);
    }

    // 2. Partial: alias is a substring of the raw key (or vice-versa)
    const partialIdx = rawLower.findIndex(
      (k) => k.includes(al) || (al.length >= 5 && al.includes(k)),
    );
    if (partialIdx !== -1) {
      const val = row[rawKeys[partialIdx]!];
      if (val !== undefined && val !== null && val !== "") return String(val);
    }

    // 3. Fuzzy: Levenshtein ≤ 2 (only for aliases ≥ 4 chars)
    if (al.length >= 4) {
      for (let i = 0; i < rawLower.length; i++) {
        if (levenshtein(al, rawLower[i]!) <= 2) {
          const val = row[rawKeys[i]!];
          if (val !== undefined && val !== null && val !== "")
            return String(val);
        }
      }
    }
  }
  return undefined;
}

// ── Map row to intermediate MappedRaw ─────────────────────────────────────────

export function mapRowToMappedRaw(
  row: RawEventRow,
  fieldMap: ConnectorFieldMap,
): MappedRaw {
  const result: MappedRaw = {};
  for (const [canonical, aliases] of Object.entries(fieldMap) as [
    keyof ConnectorFieldMap,
    string[],
  ][]) {
    if (!Array.isArray(aliases)) continue;
    const val = resolveField(row, aliases);
    if (val !== undefined) {
      (result as Record<string, string>)[canonical] = val;
    }
  }
  return result;
}

// ── MappedRaw → UnifiedBanquetEvent ──────────────────────────────────────────

export function normalizeToUnifiedEvent(
  sourceRow: RawEventRow,
  mapped: MappedRaw,
  source: ConnectorSource,
  connectorConfigId: string,
): UnifiedBanquetEvent {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    externalId: mapped.externalId ?? hashRow(sourceRow),
    source,
    connectorConfigId,

    name: (mapped.name ?? "").trim() || "Unnamed Event",
    date: mapped.date ? normalizeDate(mapped.date) : "",
    startTime: mapped.startTime ? normalizeTime(mapped.startTime) : "",
    endTime: mapped.endTime ? normalizeTime(mapped.endTime) : "",

    venue: (mapped.venue ?? "").trim(),
    room: normalizeRoomName(mapped.room ?? ""),
    floor: (mapped.floor ?? "").trim(),

    guestCount: normalizeGuestCount(mapped.guestCount ?? "0"),
    confirmedCount: mapped.confirmedCount
      ? normalizeGuestCount(mapped.confirmedCount)
      : undefined,

    bookedBy: (mapped.bookedBy ?? "").trim(),
    contactName: (mapped.contactName ?? "").trim(),
    contactEmail: (mapped.contactEmail ?? "").trim().toLowerCase(),
    contactPhone: (mapped.contactPhone ?? "").trim(),

    eventType: normalizeEventType(mapped.eventType ?? ""),
    status: (mapped.status ?? "upcoming").toLowerCase(),

    menu: (mapped.menu ?? "")
      .split(/\n|;|,(?=\s*[A-Z])/)
      .map((s) => s.trim())
      .filter(Boolean),
    dietaryRequirements: parseDietaryRequirements(mapped.dietaryNotes ?? ""),
    notes: (mapped.notes ?? "").trim(),

    estimatedRevenue: mapped.revenue
      ? normalizeRevenue(mapped.revenue)
      : undefined,

    chefInCharge: (mapped.chefInCharge ?? "").trim() || undefined,
    eventManager: (mapped.eventManager ?? "").trim() || undefined,

    sourceRaw: sourceRow,
    importedAt: now,
    lastSyncedAt: now,
    contentHash: hashRow(sourceRow),
  };
}

// ── Convenience: map + normalize in one call ──────────────────────────────────

export function processRow(
  row: RawEventRow,
  fieldMap: ConnectorFieldMap,
  source: ConnectorSource,
  connectorConfigId: string,
): UnifiedBanquetEvent {
  const mapped = mapRowToMappedRaw(row, fieldMap);
  return normalizeToUnifiedEvent(row, mapped, source, connectorConfigId);
}
