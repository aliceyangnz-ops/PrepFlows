/**
 * Normalization service — converts raw mapped string values into typed,
 * clean data matching the UnifiedBanquetEvent schema.
 *
 * All normalizers are pure functions; no side-effects or I/O.
 */

import type { UnifiedDietaryRequirement } from "../types.js";

// ── Date normalization ────────────────────────────────────────────────────────

const DATE_PATTERNS: Array<{
  re: RegExp;
  parse: (m: RegExpMatchArray) => string;
}> = [
  // ISO: 2024-12-25
  { re: /^(\d{4})-(\d{2})-(\d{2})/, parse: (m) => `${m[1]}-${m[2]}-${m[3]}` },
  // DD/MM/YYYY or DD-MM-YYYY
  {
    re: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    parse: (m) => `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`,
  },
  // MM/DD/YYYY (US format — only used if month ≤ 12)
  {
    re: /^(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    parse: (m) => {
      const mo = parseInt(m[1] ?? "0", 10);
      const dy = parseInt(m[2] ?? "0", 10);
      if (mo > 12)
        return `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
      return `${m[3]}-${m[1]!.padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
    },
  },
  // "25 Dec 2024" or "25 December 2024"
  {
    re: /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/,
    parse: (m) => {
      const mo = parseMonthName(m[2] ?? "");
      return `${m[3]}-${mo.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
    },
  },
  // "Dec 25, 2024" or "December 25, 2024"
  {
    re: /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/,
    parse: (m) => {
      const mo = parseMonthName(m[1] ?? "");
      return `${m[3]}-${mo.padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
    },
  },
];

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function parseMonthName(name: string): string {
  const n = name.toLowerCase().slice(0, 3);
  return String(MONTH_MAP[n] ?? 1).padStart(2, "0");
}

export function normalizeDate(raw: string): string {
  const s = raw.trim();
  for (const { re, parse } of DATE_PATTERNS) {
    const m = s.match(re);
    if (m) return parse(m);
  }
  // Try Date constructor as last resort
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return "";
}

// ── Time normalization ────────────────────────────────────────────────────────

export function normalizeTime(raw: string): string {
  const s = raw.trim().toLowerCase();
  // "14:30" or "14:30:00"
  let m = s.match(/^(\d{1,2}):(\d{2})/);
  if (m) {
    let h = parseInt(m[1]!, 10);
    const min = m[2]!;
    // Handle AM/PM suffix
    if (s.includes("pm") && h < 12) h += 12;
    if (s.includes("am") && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  }
  // "2pm" or "14h"
  m = s.match(/^(\d{1,2})\s*(am|pm|h)/);
  if (m) {
    let h = parseInt(m[1]!, 10);
    if (m[2] === "pm" && h < 12) h += 12;
    if (m[2] === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:00`;
  }
  // Decimal hours e.g. 14.5 → "14:30"
  m = s.match(/^(\d{1,2})\.(\d+)/);
  if (m) {
    const h = parseInt(m[1]!, 10);
    const frac = parseFloat(`0.${m[2]}`);
    const mins = Math.round(frac * 60);
    return `${String(h).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }
  return "";
}

// ── Guest count normalization ─────────────────────────────────────────────────

export function normalizeGuestCount(raw: string | number): number {
  if (typeof raw === "number") return Math.max(0, Math.round(raw));
  const s = String(raw)
    .replace(/[,_\s]/g, "")
    .replace(/approx\.?|~|ca\.?|circa/gi, "")
    .trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.max(0, Math.round(n));
}

// ── Event type normalization ──────────────────────────────────────────────────

type KitchenFunctionType =
  | "A-la-carte"
  | "Buffet"
  | "Cocktail"
  | "Canapés"
  | "Canapés + A-la-carte"
  | "School Ball"
  | "Set Menu"
  | "High Tea";

const EVENT_TYPE_MAP: Array<{ patterns: RegExp; value: KitchenFunctionType }> =
  [
    { patterns: /buffet|smorgasbord|self.?serv/i, value: "Buffet" },
    { patterns: /cocktail|standing|reception|drinks/i, value: "Cocktail" },
    {
      patterns: /canap[eé]s?\s*\+?\s*a.?la.?carte/i,
      value: "Canapés + A-la-carte",
    },
    { patterns: /canap[eé]s?/i, value: "Canapés" },
    { patterns: /school\s*ball|formal|prom/i, value: "School Ball" },
    {
      patterns: /set\s*menu|table\s*d.?h[oô]te|prix\s*fixe/i,
      value: "Set Menu",
    },
    { patterns: /high\s*tea|afternoon\s*tea/i, value: "High Tea" },
    {
      patterns: /a.?la.?carte|plated|sit.?down|seated\s*dinner/i,
      value: "A-la-carte",
    },
  ];

export function normalizeEventType(raw: string): KitchenFunctionType {
  const s = (raw ?? "").trim();
  for (const { patterns, value } of EVENT_TYPE_MAP) {
    if (patterns.test(s)) return value;
  }
  return "A-la-carte";
}

// ── Dietary requirement parsing ───────────────────────────────────────────────

const DIETARY_PATTERNS: Array<{ re: RegExp; name: string }> = [
  { re: /(\d+)\s*x?\s*(nut|peanut|tree.?nut)\s*allerg/i, name: "Nut Allergy" },
  { re: /(\d+)\s*x?\s*shellfish\s*allerg/i, name: "Shellfish Allergy" },
  { re: /(\d+)\s*x?\s*gluten.?free|(\d+)\s*x?\s*gf\b/i, name: "Gluten Free" },
  { re: /(\d+)\s*x?\s*dairy.?free|(\d+)\s*x?\s*df\b/i, name: "Dairy Free" },
  { re: /(\d+)\s*x?\s*vegan/i, name: "Vegan" },
  { re: /(\d+)\s*x?\s*vegetarian|(\d+)\s*x?\s*veg\b/i, name: "Vegetarian" },
  { re: /(\d+)\s*x?\s*halal/i, name: "Halal" },
  { re: /(\d+)\s*x?\s*kosher/i, name: "Kosher" },
  { re: /(\d+)\s*x?\s*lactose/i, name: "Lactose Intolerant" },
  { re: /(\d+)\s*x?\s*(egg|egg.?free)\s*allerg/i, name: "Egg Allergy" },
  { re: /(\d+)\s*x?\s*soy\s*allerg/i, name: "Soy Allergy" },
];

export function parseDietaryRequirements(
  raw: string,
): UnifiedDietaryRequirement[] {
  const results: UnifiedDietaryRequirement[] = [];
  const seen = new Set<string>();
  for (const { re, name } of DIETARY_PATTERNS) {
    const m = raw.match(re);
    if (m && !seen.has(name)) {
      const count = parseInt(m[1] ?? m[2] ?? "1", 10);
      results.push({ name, count, note: undefined });
      seen.add(name);
    }
  }
  return results;
}

// ── Room name normalization ───────────────────────────────────────────────────

export function normalizeRoomName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Revenue normalization ─────────────────────────────────────────────────────

export function normalizeRevenue(raw: string | number): number | undefined {
  if (typeof raw === "number") return raw >= 0 ? raw : undefined;
  const s = String(raw)
    .replace(/[$,€£¥\s]/g, "")
    .trim();
  const n = parseFloat(s);
  return isNaN(n) ? undefined : Math.max(0, n);
}

// ── Hash helper ───────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";

export function hashRow(row: Record<string, unknown>): string {
  const stable = JSON.stringify(row, Object.keys(row).sort());
  return createHash("sha256").update(stable).digest("hex").slice(0, 16);
}
