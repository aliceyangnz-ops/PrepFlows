/**
 * Import Parser Service
 *
 * Converts spreadsheet rows (from Moments Explorer, Delphi, Opera, iVvy, Priava,
 * Tripleseat, or any generic XLSX/CSV export) into KitchenFunction records.
 *
 * Strategy:
 *  1. Detect source system from filename / column names
 *  2. Auto-map columns to canonical kitchen fields
 *  3. Parse and validate each row
 *  4. Generate timeline, dietary alerts, and prep scaffold
 */

import type { ParsedImportRow, KitchenFunctionRow } from "@workspace/db";

// ─── Column name aliases ───────────────────────────────────────────────────
const COLUMN_ALIASES: Record<string, string[]> = {
  name:          ["function name", "event name", "booking name", "event", "function", "name", "subject", "title", "event title", "booking"],
  date:          ["date", "event date", "function date", "booking date", "start date", "event day"],
  startTime:     ["start time", "start", "time from", "begin time", "arrival time", "open time", "service start"],
  endTime:       ["end time", "end", "time to", "finish time", "close time", "departure time", "service end"],
  venue:         ["venue", "location", "property", "hotel", "site"],
  room:          ["room", "room name", "space", "area", "ballroom", "hall", "suite", "venue space"],
  floor:         ["floor", "level", "building", "section"],
  pax:           ["pax", "covers", "guests", "guest count", "attendees", "persons", "numbers", "headcount", "guest numbers"],
  menu:          ["menu", "food", "food & beverage", "f&b", "menu details", "catering", "food details", "meal"],
  dietaryNotes:  ["dietary", "dietary notes", "dietary requirements", "dietary needs", "special meals", "special requirements", "allergens", "allergies", "diet"],
  eventNotes:    ["notes", "event notes", "comments", "remarks", "special notes", "instructions", "additional notes", "client notes"],
  functionType:  ["type", "function type", "event type", "booking type", "format", "style", "package"],
  chefInCharge:  ["chef", "chef in charge", "executive chef", "head chef", "assigned chef", "cook"],
};

// ─── Source system detection ───────────────────────────────────────────────
export type SourceSystem = "moments_explorer" | "delphi" | "opera" | "ivvy" | "priava" | "tripleseat" | "generic";

export function detectSourceSystem(filename: string, headers: string[]): SourceSystem {
  const lc = filename.toLowerCase();
  if (lc.includes("moments"))    return "moments_explorer";
  if (lc.includes("delphi"))     return "delphi";
  if (lc.includes("opera"))      return "opera";
  if (lc.includes("ivvy"))       return "ivvy";
  if (lc.includes("priava"))     return "priava";
  if (lc.includes("tripleseat")) return "tripleseat";

  const headerStr = headers.join(" ").toLowerCase();
  if (headerStr.includes("folio") || headerStr.includes("guestroom"))    return "opera";
  if (headerStr.includes("prospect") || headerStr.includes("peak"))      return "delphi";
  if (headerStr.includes("quote") && headerStr.includes("ivvy"))         return "ivvy";

  return "generic";
}

// ─── Column mapping ────────────────────────────────────────────────────────
export function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const header of headers) {
    const normalized = header.trim().toLowerCase();
    for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.some((a) => normalized === a || normalized.includes(a))) {
        if (!mapping[canonical]) {
          mapping[canonical] = header;
        }
      }
    }
  }
  return mapping;
}

// ─── Time parsing ─────────────────────────────────────────────────────────
function parseTime(value: string | undefined): string {
  if (!value) return "";
  const v = String(value).trim();

  // Already HH:MM
  if (/^\d{1,2}:\d{2}$/.test(v)) {
    const [h, m] = v.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // 12-hour with am/pm: "7:30pm", "7:30 PM"
  const ampm = v.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2] || "0", 10);
    const isPm = ampm[3].toLowerCase() === "pm";
    if (isPm && h !== 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Excel serial time (fractional day)
  const num = parseFloat(v);
  if (!isNaN(num) && num >= 0 && num < 1) {
    const totalMinutes = Math.round(num * 24 * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return "";
}

// ─── Date parsing ─────────────────────────────────────────────────────────
function parseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const v = String(value).trim();
  if (!v) return undefined;

  // ISO: 2025-06-15
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  // Excel serial number
  const num = parseFloat(v);
  if (!isNaN(num) && num > 1000) {
    const date = new Date((num - 25569) * 86400 * 1000);
    return date.toISOString().slice(0, 10);
  }

  // DD/MM/YYYY or MM/DD/YYYY
  const parts = v.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 1000) {
      // DD/MM/YYYY (AU format — preferred for catering)
      const date = new Date(c, b - 1, a);
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
  }

  // Try native parse as fallback
  const d = new Date(v);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

  return undefined;
}

// ─── Pax parsing ──────────────────────────────────────────────────────────
function parsePax(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = parseInt(String(value).replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? undefined : n;
}

// ─── Function type detection ───────────────────────────────────────────────
const FUNCTION_TYPES = ["A-la-carte", "Buffet", "Cocktail", "Canapés", "Canapés + A-la-carte", "School Ball", "Set Menu", "High Tea"] as const;
type FunctionType = typeof FUNCTION_TYPES[number];

function detectFunctionType(raw: string | undefined, name: string, menu: string): FunctionType {
  const combined = `${raw || ""} ${name} ${menu}`.toLowerCase();
  if (combined.includes("buffet"))                            return "Buffet";
  if (combined.includes("cocktail"))                         return "Cocktail";
  if (combined.includes("canape") || combined.includes("canapé")) return "Canapés";
  if (combined.includes("school ball") || combined.includes("formal")) return "School Ball";
  if (combined.includes("set menu"))                         return "Set Menu";
  if (combined.includes("high tea") || combined.includes("afternoon tea")) return "High Tea";
  if (combined.includes("a la carte") || combined.includes("a-la-carte")) return "A-la-carte";
  return "A-la-carte";
}

// ─── Dietary parsing ──────────────────────────────────────────────────────
interface DietaryReq { name: string; count: number; note?: string }

function parseDietary(notes: string | undefined): DietaryReq[] {
  if (!notes) return [];
  const result: DietaryReq[] = [];
  const text = String(notes);

  const patterns: [RegExp, string][] = [
    [/(\d+)\s*x?\s*(gluten[- ]?free|gf\b)/gi,     "Gluten Free"],
    [/(\d+)\s*x?\s*(vegan|vgn)/gi,                  "Vegan"],
    [/(\d+)\s*x?\s*(vegetarian|vgt|veg\b)/gi,       "Vegetarian"],
    [/(\d+)\s*x?\s*(dairy[- ]?free|df\b)/gi,        "Dairy Free"],
    [/(\d+)\s*x?\s*(nut[- ]?free|nut allerg)/gi,    "Nut Free"],
    [/(\d+)\s*x?\s*(shellfish|seafood allerg)/gi,   "Shellfish Allergy"],
    [/(\d+)\s*x?\s*(halal)/gi,                      "Halal"],
    [/(\d+)\s*x?\s*(kosher)/gi,                     "Kosher"],
    [/(\d+)\s*x?\s*(egg[- ]?free)/gi,               "Egg Free"],
  ];

  for (const [pattern, name] of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const existing = result.find((r) => r.name === name);
      if (existing) {
        existing.count += parseInt(m[1], 10);
      } else {
        result.push({ name, count: parseInt(m[1], 10), note: "" });
      }
    }
  }

  // If no structured counts found, add as a single note item
  if (result.length === 0 && text.trim().length > 2) {
    result.push({ name: "Special Requirements", count: 1, note: text.trim() });
  }

  return result;
}

// ─── Timeline generation ───────────────────────────────────────────────────
function generateTimeline(
  startTime: string,
  endTime: string,
  guestCount: number,
  functionType: FunctionType,
  dietaryReqs: DietaryReq[],
): KitchenFunctionRow["timeline"] {
  const items: Array<{ id: string; time: string; task: string; category: string; completed: boolean }> = [];

  function addMins(time: string, mins: number): string {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + mins;
    const nh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
    const nm = ((total % 1440) + 1440) % 60;
    return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
  }

  const hasDietary = dietaryReqs.length > 0;
  const large = guestCount > 100;
  const kitchenOpen = addMins(startTime, -300); // 5h before
  const prepStart = addMins(startTime, -180);
  const venueCheck = addMins(startTime, -30);
  const brief = addMins(startTime, -15);

  let idx = 1;
  const tid = () => `t${Date.now()}_${idx++}`;

  items.push({ id: tid(), time: kitchenOpen, task: `KITCHEN OPEN — Mise en place. All stations set, HACCP sheets started. Cold room temp check.`, category: "setup", completed: false });
  items.push({ id: tid(), time: prepStart, task: `Prep commenced — ${functionType} for ${guestCount} covers. All dietary alternates clearly labelled and separated.${hasDietary ? " " + dietaryReqs.map((d) => `${d.count} × ${d.name}`).join(", ") + "." : ""}`, category: "setup", completed: false });
  items.push({ id: tid(), time: venueCheck, task: `VENUE CHECK — Room set, crockery polished, mise en place on pass.${large ? " Table numbers confirmed vs seating chart." : ""}`, category: "venue", completed: false });
  items.push({ id: tid(), time: brief, task: `PRE-SERVICE BRIEF — All team. ${hasDietary ? "Allergen plan reviewed. " : ""}Kitchen radio comms check. Head Chef to sign off.`, category: "brief", completed: false });
  items.push({ id: tid(), time: startTime, task: `GUESTS ARRIVE — ${functionType} service begins. ${guestCount} covers. ${hasDietary ? "Dietary alternates on separate tray — labelled & ready." : ""}`, category: "service", completed: false });

  if (functionType === "Buffet") {
    items.push({ id: tid(), time: addMins(endTime, -30), task: `BUFFET CLOSING — Begin clearing stations. Replenish if required. Signal to close.`, category: "service", completed: false });
  } else {
    const mid = addMins(startTime, Math.floor((parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]) - parseInt(startTime.split(":")[0]) * 60 - parseInt(startTime.split(":")[1])) / 2));
    items.push({ id: tid(), time: mid, task: `MAIN SERVICE — All covers on pass. Quality check before away.${hasDietary ? " Dietary plates confirmed and labelled." : ""}`, category: "service", completed: false });
  }

  items.push({ id: tid(), time: addMins(endTime, -15), task: `Last covers cleared. Pass broken down. Leftover food labelled & chilled.`, category: "close", completed: false });
  items.push({ id: tid(), time: endTime, task: `KITCHEN CLEAR — All surfaces sanitised. HACCP sheets completed & signed. Waste logged.`, category: "close", completed: false });

  return items;
}

// ─── Row → KitchenFunction ─────────────────────────────────────────────────
export function convertRowToFunction(
  row: ParsedImportRow,
  importJobId: string,
  sourceSystem: SourceSystem,
): Omit<KitchenFunctionRow, "createdAt" | "updatedAt"> {
  const id = `import_${importJobId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const startTime = parseTime(row.startTime) || "09:00";
  const endTime   = parseTime(row.endTime)   || "17:00";
  const guestCount = parsePax(row.pax?.toString()) || 0;
  const menu = row.menu ? [row.menu] : [];
  const functionType = detectFunctionType(row.functionType, row.name, menu.join(" "));
  const dietaryRequirements = parseDietary(row.dietaryNotes);
  const timeline = generateTimeline(startTime, endTime, guestCount, functionType, dietaryRequirements);

  // Venue/room split: "Ballroom A — Level 1" or "Level 1 / Ballroom A"
  let room = row.room || row.venue || "";
  let floor = row.floor || "";
  if (!floor && room.includes("Level")) {
    const parts = room.split(/[-–—\/]/);
    room = parts[0]?.trim() || room;
    floor = parts[1]?.trim() || "";
  }

  return {
    id,
    name: row.name,
    room,
    floor,
    functionType,
    date: parseDate(row.date) ?? null,
    startTime,
    endTime,
    guestCount,
    status: "upcoming",
    menu,
    dietaryRequirements,
    serviceTimes: null,
    serviceEvents: [],
    teamIds: [],
    timeline,
    chefInCharge: row.chefInCharge ?? null,
    importJobId,
    sourceSystem,
  };
}

// ─── Validation ────────────────────────────────────────────────────────────
export interface ValidationError { row: number; field: string; message: string }
export interface ValidationWarning { row: number; field: string; message: string }

export function validateRow(
  row: ParsedImportRow,
  rowIndex: number,
  existingNames: Set<string>,
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!row.name?.trim()) {
    errors.push({ row: rowIndex, field: "name", message: "Event name is required" });
  }

  if (!row.startTime || !parseTime(row.startTime)) {
    warnings.push({ row: rowIndex, field: "startTime", message: "Start time missing or could not be parsed — defaulting to 09:00" });
  }

  if (!row.endTime || !parseTime(row.endTime)) {
    warnings.push({ row: rowIndex, field: "endTime", message: "End time missing or could not be parsed — defaulting to 17:00" });
  }

  if (row.pax !== undefined && row.pax !== null) {
    const n = Number(row.pax);
    if (isNaN(n) || n < 1 || n > 10000) {
      warnings.push({ row: rowIndex, field: "pax", message: `Pax count ${row.pax} looks unusual — please verify` });
    }
  }

  if (row.name && existingNames.has(row.name.trim().toLowerCase())) {
    warnings.push({ row: rowIndex, field: "name", message: `Duplicate event name: "${row.name}" — will be imported anyway` });
  }

  return { errors, warnings };
}

// ─── Raw row → ParsedImportRow ─────────────────────────────────────────────
export function mapRawRow(
  rawRow: Record<string, unknown>,
  columnMapping: Record<string, string>,
): ParsedImportRow {
  function get(canonical: string): string | undefined {
    const header = columnMapping[canonical];
    if (!header) return undefined;
    const val = rawRow[header];
    return val !== null && val !== undefined ? String(val).trim() : undefined;
  }

  return {
    name:         get("name")          || "(Unnamed Event)",
    date:         get("date"),
    startTime:    get("startTime"),
    endTime:      get("endTime"),
    venue:        get("venue"),
    room:         get("room"),
    floor:        get("floor"),
    pax:          get("pax") ? parsePax(get("pax")) : undefined,
    menu:         get("menu"),
    dietaryNotes: get("dietaryNotes"),
    eventNotes:   get("eventNotes"),
    functionType: get("functionType"),
    chefInCharge: get("chefInCharge"),
  };
}
