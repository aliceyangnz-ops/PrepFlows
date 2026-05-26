/**
 * AI Parse Route
 *
 * Intelligent document parsing for kitchen function sheets.
 * Accepts: plain text, Word (.docx), PDF, or base64-encoded images.
 * Returns: structured ParsedFunctionData ready to populate the add-function form.
 *
 * When OpenAI env vars are present (AI_INTEGRATIONS_OPENAI_BASE_URL +
 * AI_INTEGRATIONS_OPENAI_API_KEY), GPT-4o is used for text and vision for
 * images. Otherwise falls back to a comprehensive rule-based parser.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

// ── Optional OpenAI client ─────────────────────────────────────────────────
const openai =
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL &&
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY
    ? new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      })
    : null;

// ── Types ──────────────────────────────────────────────────────────────────

export interface ParsedFunctionData {
  name: string;
  room: string;
  floor: string;
  date: string;
  functionType: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  menu: string[];
  serviceEvents: Array<{ time: string; label: string }>;
  dietaryRequirements: Array<{ name: string; count: number; note: string }>;
  specialRequirements: string[];
  prepItems: Array<{ team: string; dish: string; quantity: string; deadline: string }>;
  confidence: Record<string, number>;
  aiUsed: boolean;
}

// ── Time helpers ───────────────────────────────────────────────────────────

function normaliseTime(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (s === "noon" || s === "midday") return "12:00";
  if (s === "midnight") return "00:00";
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?([ap]m)?$/);
  if (!m) return "";
  let h = parseInt(m[1] ?? "0", 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  if (m[3] === "pm" && h !== 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function parseDate(text: string): string {
  // ISO
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1]!;
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = text.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/);
  if (dmy) {
    const [, d, mo, y] = dmy;
    return `${y}-${(mo ?? "01").padStart(2, "0")}-${(d ?? "01").padStart(2, "0")}`;
  }
  // Long-form: "15 March 2026", "March 15 2026"
  const months: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
    jan: "01", feb: "02", mar: "03", apr: "04",
    jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const long = text.match(/\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\b/i);
  if (long) {
    const [, d, mo, y] = long;
    const mm = months[(mo ?? "").toLowerCase()] ?? "01";
    return `${y}-${mm}-${(d ?? "01").padStart(2, "0")}`;
  }
  const longRev = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})[,\s]+(\d{4})\b/i);
  if (longRev) {
    const [, mo, d, y] = longRev;
    const mm = months[(mo ?? "").toLowerCase()] ?? "01";
    return `${y}-${mm}-${(d ?? "01").padStart(2, "0")}`;
  }
  return "";
}

// ── Prep team assignment ───────────────────────────────────────────────────

function assignPrepTeam(item: string): string {
  const l = item.toLowerCase();
  const pastry = ["cake", "tart", "torte", "crème brûlée", "panna cotta", "tiramisu",
    "mousse", "pudding", "soufflé", "éclair", "macaron", "brownie", "biscuit", "pie",
    "pastry", "parfait", "ice cream", "sorbet", "gelato", "trifle", "cheesecake",
    "baklava", "profiterole", "mille-feuille", "religious", "fondant", "pavlova",
    "meringue", "custard", "crêpe", "waffle", "churro", "danish"];
  const coldLarder = ["salad", "gazpacho", "cold", "carpaccio", "ceviche", "tartare",
    "sashimi", "oyster", "prawn cocktail", "smoked salmon", "terrine", "roulade",
    "cheese", "charcuterie", "antipasto", "caprese", "crudité"];
  const functionTeam = ["canapé", "canape", "amuse-bouche", "amuse bouche", "bread",
    "roll", "cracker", "reception bite", "finger food", "blini", "bruschetta"];

  if (pastry.some((k) => l.includes(k))) return "Pastry";
  if (coldLarder.some((k) => l.includes(k))) return "Cold Larder";
  if (functionTeam.some((k) => l.includes(k))) return "Function Team";
  return "Hot Kitchen";
}

function prepDeadline(team: string, startTime: string): string {
  if (!startTime) return "Before service";
  const [h, m] = startTime.split(":").map(Number);
  const base = (h ?? 0) * 60 + (m ?? 0);
  const offsets: Record<string, number> = {
    "Pastry": -240,
    "Cold Larder": -180,
    "Hot Kitchen": -120,
    "Function Team": -60,
  };
  const target = base + (offsets[team] ?? -120);
  const nh = Math.floor(((target % 1440) + 1440) % 1440 / 60);
  const nm = ((target % 60) + 60) % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function generatePrepItems(
  menu: string[],
  guestCount: number,
  startTime: string,
): ParsedFunctionData["prepItems"] {
  return menu.map((item) => {
    const dish = item.replace(/^[^:]+:\s*/, "").trim();
    const team = assignPrepTeam(dish);
    return {
      team,
      dish,
      quantity: guestCount > 0 ? `${guestCount} portions` : "As required",
      deadline: prepDeadline(team, startTime),
    };
  });
}

// ── Menu extraction ────────────────────────────────────────────────────────

const COURSE_HEADERS: Array<{ re: RegExp; label: string }> = [
  { re: /^(?:amuse[- ]?bouche|reception\s+bites?|arrival\s+canapé)/i,          label: "Amuse-bouche" },
  { re: /^(?:canapé|canape|finger\s+food|pre[- ]?dinner)/i,                    label: "Canapés" },
  { re: /^(?:entr[ée]e?s?|starters?|first\s+course|appetizer)/i,              label: "Entrée" },
  { re: /^(?:soup|bisque|consommé|velouté|broth)/i,                            label: "Soup" },
  { re: /^(?:salad|garden\s+salad)/i,                                          label: "Salad" },
  { re: /^(?:main[s]?|second\s+course|principal|mains?\s+course|plats?\s+principal)/i, label: "Main" },
  { re: /^(?:dessert[s]?|sweet[s]?|pudding|third\s+course|pastry|gâteau)/i,   label: "Dessert" },
  { re: /^(?:cheese|fromage|cheese\s+board)/i,                                 label: "Cheese" },
  { re: /^(?:supper|late\s+snack|midnight\s+snack)/i,                         label: "Supper" },
  { re: /^(?:beverage|bar|drinks?|wine|champagne)\s+package/i,                 label: "Beverage" },
];

function extractMenu(text: string): string[] {
  const lines = text.split(/\n/).map((l) => l.trim());
  const menu: string[] = [];

  let currentCourse = "";
  let inMenuSection = false;

  // Check if there's a MENU section header
  const menuHeaderIdx = lines.findIndex((l) =>
    /^(?:MENU|FOOD\s+&\s+BEVERAGE|F&B|FOOD\s+MENU|CATERING\s+MENU|EVENT\s+MENU|FUNCTION\s+MENU)[\s:]*$/i.test(l)
  );
  const startIdx = menuHeaderIdx >= 0 ? menuHeaderIdx + 1 : 0;
  inMenuSection = menuHeaderIdx >= 0;

  const STOP_SECTIONS = /^(?:DIETARY|ALLERGEN|BEVERAGE|SERVICE|TIMELINE|SCHEDULE|TEAM|STAFF|NOTES?|SPECIAL|CONTACT|BILLING|PAYMENT|DEPOSIT)\b/i;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!line) continue;
    if (i > startIdx && STOP_SECTIONS.test(line) && !inMenuSection) break;
    if (i > startIdx + 2 && STOP_SECTIONS.test(line)) break;

    // Check if this line is a course header
    let matched = false;
    for (const { re, label } of COURSE_HEADERS) {
      const headerRe = new RegExp(`^${re.source}[\\s:–—]*(.*)$`, "i");
      const m = line.match(headerRe);
      if (m) {
        currentCourse = label;
        inMenuSection = true;
        // Inline item after course header
        const inline = (m[1] ?? "").trim();
        if (inline && inline.length > 2 && !/^(?:OR|AND|WITH)\b/i.test(inline)) {
          menu.push(`${label}: ${inline}`);
        }
        matched = true;
        break;
      }
    }
    if (matched) continue;

    if (!inMenuSection) continue;

    // Skip obvious non-food lines
    if (/^(?:OR\b|AND\b|INCLUDED|NOTE:|SUBJECT|DATE:|TIME:|ROOM:|GUEST|PAX|COVERS)/i.test(line)) continue;
    if (/^\d{1,2}[:\.]\d{2}/.test(line)) continue; // time
    if (/^[A-Z ]{15,}:?\s*$/.test(line)) continue; // all-caps section header

    // Bullet or numbered list items
    const bulletMatch = line.match(/^[•\-–—*]\s*(.+)/) || line.match(/^\d+[\.\)]\s*(.+)/);
    if (bulletMatch) {
      const item = (bulletMatch[1] ?? "").trim();
      if (item.length > 3) {
        menu.push(currentCourse ? `${currentCourse}: ${item}` : item);
      }
      continue;
    }

    // Plain line that looks like a dish (not too long, not a header)
    if (line.length >= 5 && line.length <= 120 && currentCourse) {
      // Skip if it looks like a description/sentence
      if ((line.match(/\s/g) ?? []).length <= 8 || line.includes(",")) {
        menu.push(`${currentCourse}: ${line}`);
      }
    }
  }

  return menu.slice(0, 40);
}

// ── Enhanced rule-based parser ─────────────────────────────────────────────

function parseHospitalityText(text: string): ParsedFunctionData {
  const lower = text.toLowerCase();
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const conf: Record<string, number> = {};

  // Name
  let name = "";
  const namePats = [
    /^(?:function\s+name|event\s+name|booking\s+name|client\s+name|client|function|event|booking|subject|re|reference):\s*(.+)/im,
    /^(?:dear\s+\w+,?\s*\n+)([\w\s&']{4,60})/im,
  ];
  for (const p of namePats) {
    const m = text.match(p);
    if (m?.[1]?.trim()) { name = m[1].trim().slice(0, 80); conf["name"] = 90; break; }
  }
  if (!name) {
    // First meaningful line
    for (const line of lines) {
      if (
        line.length >= 4 && line.length <= 80 &&
        !/^(?:dear|hi |hello|from:|to:|date:|time:|room:|floor:|level:|guests?:|pax:|dietary|service|event\s*id|function\s*id|ref:|phone|email|http|venue:|location:)/i.test(line) &&
        !/^\d{1,2}[:/]\d{2}/.test(line) &&
        !/^\d+\s*(?:pax|guests?|covers?)/.test(line)
      ) {
        name = line.slice(0, 80);
        conf["name"] = 60;
        break;
      }
    }
  }

  // Date
  const date = parseDate(text);
  if (date) conf["date"] = 90;

  // Times
  let startTime = "", endTime = "";
  const TRE = /\d{1,2}(?::\d{2})?\s*(?:[ap]m)?/i;
  const range = text.match(new RegExp(`(${TRE.source})\\s*(?:to|until|through|–|—|-)\\s*(${TRE.source})`, "i"));
  if (range) {
    const s = normaliseTime(range[1] ?? "");
    const e = normaliseTime(range[2] ?? "");
    if (s) { startTime = s; conf["startTime"] = 90; }
    if (e) { endTime = e; conf["endTime"] = 90; }
  } else {
    const sm = text.match(/(?:start(?:s|ing)?\s*(?:time)?:|commences?:|from\s+)((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i);
    if (sm) { const t = normaliseTime(sm[1] ?? ""); if (t) { startTime = t; conf["startTime"] = 80; } }
    const em = text.match(/(?:end(?:s|ing)?\s*(?:time)?:|finish(?:es)?:|close[sd]?:|concludes?:|until\s+)((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i);
    if (em) { const t = normaliseTime(em[1] ?? ""); if (t) { endTime = t; conf["endTime"] = 80; } }
  }

  // Guest count
  let guestCount = 0;
  const paxM =
    text.match(/(\d{1,4})\s*(?:pax|guests?|covers?|people|attendees?|persons?|heads?\b)/i) ||
    text.match(/(?:for|of)\s+(\d{1,4})\s*(?:pax|guests?|people)/i) ||
    text.match(/(?:capacity|attendance|numbers?):\s*(\d{1,4})/i);
  if (paxM) { guestCount = parseInt(paxM[1] ?? "0", 10); conf["guestCount"] = 85; }

  // Room
  let room = "";
  const roomPats = [
    /^(?:room|space|venue\s*space|function\s*room):\s*(.+)/im,
    /^(?:venue|location|held\s+at|held\s+in):\s*(.+)/im,
    /(?:in\s+the\s+)([\w\s]+(?:room|hall|ballroom|suite|lounge|terrace|function\s+room))\b/i,
    /(?:at\s+the\s+)([\w\s]+(?:ballroom|hall|suite|lounge|terrace))\b/i,
  ];
  for (const p of roomPats) {
    const m = text.match(p);
    if (m?.[1]?.trim() && m[1].trim().length > 1) {
      room = m[1].trim().slice(0, 60);
      conf["room"] = 85;
      break;
    }
  }

  // Floor/level
  let floor = "";
  const floorM = text.match(/(level\s*\d+|ground\s+floor|lower\s+ground|mezzanine|first\s+floor|second\s+floor|third\s+floor|basement|\d+(?:st|nd|rd|th)\s+floor)/i);
  if (floorM) { floor = floorM[1]!.trim(); conf["floor"] = 80; }

  // Function type
  let functionType = "A-la-carte";
  const typeMap: [string[], string][] = [
    [["cocktail party", "drinks function", "standing cocktail", "cocktail reception"], "Cocktail"],
    [["buffet", "smorgasbord", "self service", "self-service", "carvery"], "Buffet"],
    [["high tea", "afternoon tea", "high-tea"], "High Tea"],
    [["school ball", "school formal", "year 12", "formal dinner", "prom"], "School Ball"],
    [["canapés + a-la-carte", "canapes + a la carte", "canapé + a la carte"], "Canapés + A-la-carte"],
    [["canapé", "canape", "finger food", "canapés"], "Canapés"],
    [["set menu", "prix fixe", "degustation", "tasting menu", "fixed menu"], "Set Menu"],
    [["cocktail"], "Cocktail"],
  ];
  for (const [keywords, type] of typeMap) {
    if (keywords.some((kw) => lower.includes(kw))) { functionType = type; conf["functionType"] = 80; break; }
  }

  // Dietary requirements
  const dietaryPatterns: Array<{ re: RegExp; label: string }> = [
    { re: /(\d+)\s*(?:x\s*)?(?:gluten[- ]?free|gf\b)/i,    label: "Gluten Free" },
    { re: /\bgf\s*[x×:]\s*(\d+)|\b(\d+)\s*gf\b/i,          label: "Gluten Free" },
    { re: /(\d+)\s*(?:x\s*)?vegan/i,                         label: "Vegan" },
    { re: /(\d+)\s*(?:x\s*)?vegetarian/i,                   label: "Vegetarian" },
    { re: /(\d+)\s*(?:x\s*)?dairy[- ]?free/i,               label: "Dairy Free" },
    { re: /(\d+)\s*(?:x\s*)?(?:nut|peanut|tree\s*nut)[- ]?allerg/i, label: "Nut Allergy" },
    { re: /(\d+)\s*(?:x\s*)?shellfish[- ]?allerg/i,         label: "Shellfish Allergy" },
    { re: /(\d+)\s*(?:x\s*)?halal/i,                        label: "Halal" },
    { re: /(\d+)\s*(?:x\s*)?kosher/i,                       label: "Kosher" },
    { re: /(\d+)\s*(?:x\s*)?egg[- ]?free/i,                 label: "Egg Free" },
  ];
  const dietaryRequirements: ParsedFunctionData["dietaryRequirements"] = [];
  const seenDiet = new Set<string>();
  for (const { re, label } of dietaryPatterns) {
    if (seenDiet.has(label)) continue;
    const m = text.match(re);
    if (m) {
      const count = parseInt(m[1] ?? m[2] ?? "1", 10);
      dietaryRequirements.push({ name: label, count, note: "" });
      seenDiet.add(label);
    }
  }
  if (dietaryRequirements.length > 0) conf["dietary"] = 90;

  // Service events (course times)
  const serviceEvents: ParsedFunctionData["serviceEvents"] = [];
  const coursePats: Array<{ re: RegExp; label: string }> = [
    { re: /(?:amuse[- ]?bouche|arrival\s+canapé)s?\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Amuse-bouche" },
    { re: /(?:entr[ée]e?s?|starters?|first\s+course)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Entrée Away" },
    { re: /(?:soup|bisque|consommé)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Soup Away" },
    { re: /(?:salad)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Salad Away" },
    { re: /(?:main[s]?|second\s+course|mains?\s+course)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Main Away" },
    { re: /(?:dessert[s]?|sweet[s]?|third\s+course)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Dessert Away" },
    { re: /(?:cheese)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Cheese Away" },
    { re: /(?:supper|late\s+snack)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Supper" },
    { re: /(?:buffet\s+open[s]?|buffet\s+service)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Buffet Open" },
    { re: /(?:buffet\s+clos(?:e[sd]?|ing))\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Buffet Closed" },
    { re: /(?:canapé|canape)\s*service?\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Canapés Service" },
    { re: /(?:high\s+tea|tea\s+service)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "High Tea Served" },
  ];
  for (const { re, label } of coursePats) {
    const m = text.match(re);
    if (m?.[1]) {
      const t = normaliseTime(m[1]);
      if (t) serviceEvents.push({ time: t, label });
    }
  }
  serviceEvents.sort((a, b) => a.time.localeCompare(b.time));
  if (serviceEvents.length > 0) conf["serviceEvents"] = 80;

  // Special requirements (extract general notes)
  const specialRequirements: string[] = [];
  const specialPats = [
    /(?:special\s+requirements?|special\s+notes?|client\s+notes?|instructions?):\s*(.+?)(?:\n|$)/gi,
    /(?:AV\s+requirements?|audio\s+visual|microphone|projector|screen|podium|stage).*?(?:\n|$)/gi,
    /(?:flowers?|florals?|centrepiece|decoration|theming).*?(?:\n|$)/gi,
    /(?:car\s+park|parking|valet|shuttle|transport).*?(?:\n|$)/gi,
  ];
  for (const p of specialPats) {
    let m: RegExpExecArray | null;
    while ((m = p.exec(text)) !== null) {
      const item = (m[1] ?? m[0] ?? "").trim();
      if (item.length > 5 && item.length < 200) specialRequirements.push(item);
      if (specialRequirements.length >= 5) break;
    }
  }

  // Menu
  const menu = extractMenu(text);
  if (menu.length > 0) conf["menu"] = 80;

  // Prep items auto-generated from menu
  const prepItems = generatePrepItems(menu, guestCount, startTime);

  return {
    name, room, floor, date, functionType, startTime, endTime, guestCount,
    menu, serviceEvents, dietaryRequirements, specialRequirements, prepItems,
    confidence: conf,
    aiUsed: false,
  };
}

// ── OpenAI system prompt ───────────────────────────────────────────────────

const AI_SYSTEM = `You are a kitchen operations assistant specialising in hospitality. Extract structured data from the provided function sheet, BEO (Banquet Event Order), or event brief document.

Return ONLY valid JSON matching this exact TypeScript interface (no markdown, no explanation):
{
  "name": string,
  "room": string,
  "floor": string,
  "date": string, // YYYY-MM-DD or ""
  "functionType": string, // one of: A-la-carte | Buffet | Cocktail | Canapés | Canapés + A-la-carte | School Ball | Set Menu | High Tea
  "startTime": string, // HH:MM or ""
  "endTime": string, // HH:MM or ""
  "guestCount": number,
  "menu": string[], // each item prefixed with course: "Entrée: Sesame Tuna", "Main: Beef Tenderloin"
  "serviceEvents": [{ "time": string, "label": string }],
  "dietaryRequirements": [{ "name": string, "count": number, "note": string }],
  "specialRequirements": string[],
  "prepItems": [{ "team": "Hot Kitchen"|"Cold Larder"|"Pastry"|"Function Team", "dish": string, "quantity": string, "deadline": string }]
}

Rules:
- Extract ALL menu items with their course prefix
- Generate prep items for each menu item with realistic prep deadlines (e.g. "14:00")
- For dietary requirements, extract counts (e.g. "3 × Gluten Free" → count: 3)
- functionType must match exactly one of the allowed values
- If a field is not present, use "" or [] or 0 as appropriate`;

async function parseWithAI(text: string): Promise<ParsedFunctionData> {
  if (!openai) throw new Error("AI not available");

  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: AI_SYSTEM },
      { role: "user", content: `Parse this function sheet:\n\n${text}` },
    ],
    temperature: 0.1,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  const data = JSON.parse(raw) as Partial<ParsedFunctionData>;

  return {
    name: data.name ?? "",
    room: data.room ?? "",
    floor: data.floor ?? "",
    date: data.date ?? "",
    functionType: data.functionType ?? "A-la-carte",
    startTime: data.startTime ?? "",
    endTime: data.endTime ?? "",
    guestCount: data.guestCount ?? 0,
    menu: Array.isArray(data.menu) ? data.menu : [],
    serviceEvents: Array.isArray(data.serviceEvents) ? data.serviceEvents : [],
    dietaryRequirements: Array.isArray(data.dietaryRequirements) ? data.dietaryRequirements : [],
    specialRequirements: Array.isArray(data.specialRequirements) ? data.specialRequirements : [],
    prepItems: Array.isArray(data.prepItems) ? data.prepItems : [],
    confidence: {},
    aiUsed: true,
  };
}

async function parseImageWithAI(base64: string, mimeType: string): Promise<ParsedFunctionData> {
  if (!openai) throw new Error("Vision AI not available");

  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: AI_SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all function sheet data from this document image:" },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" } },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  const data = JSON.parse(raw) as Partial<ParsedFunctionData>;

  return {
    name: data.name ?? "",
    room: data.room ?? "",
    floor: data.floor ?? "",
    date: data.date ?? "",
    functionType: data.functionType ?? "A-la-carte",
    startTime: data.startTime ?? "",
    endTime: data.endTime ?? "",
    guestCount: data.guestCount ?? 0,
    menu: Array.isArray(data.menu) ? data.menu : [],
    serviceEvents: Array.isArray(data.serviceEvents) ? data.serviceEvents : [],
    dietaryRequirements: Array.isArray(data.dietaryRequirements) ? data.dietaryRequirements : [],
    specialRequirements: Array.isArray(data.specialRequirements) ? data.specialRequirements : [],
    prepItems: Array.isArray(data.prepItems) ? data.prepItems : [],
    confidence: {},
    aiUsed: true,
  };
}

// ── Smart parse orchestrator ───────────────────────────────────────────────

async function smartParseText(text: string): Promise<ParsedFunctionData> {
  if (openai) {
    try {
      return await parseWithAI(text);
    } catch {
      // Fall through to rule-based parser
    }
  }
  return parseHospitalityText(text);
}

async function smartParseImage(base64: string, mimeType: string): Promise<ParsedFunctionData> {
  if (openai) {
    try {
      return await parseImageWithAI(base64, mimeType);
    } catch {
      // Fall through
    }
  }
  return {
    name: "", room: "", floor: "", date: "", functionType: "A-la-carte",
    startTime: "", endTime: "", guestCount: 0,
    menu: [], serviceEvents: [], dietaryRequirements: [],
    specialRequirements: ["Image reading requires AI — please enable the AI integration or import as a file"],
    prepItems: [], confidence: {}, aiUsed: false,
  };
}

// ── Route: parse text or image ─────────────────────────────────────────────

/**
 * POST /api/import/ai-parse
 * Body: { content: string, type?: "text" | "image_base64", mimeType?: string }
 */
router.post("/import/ai-parse", async (req: Request, res: Response) => {
  const { content, type = "text", mimeType = "image/jpeg" } = req.body as {
    content: string;
    type?: "text" | "image_base64";
    mimeType?: string;
  };

  if (!content) {
    res.status(400).json({ error: "No content provided" });
    return;
  }

  try {
    const result = type === "image_base64"
      ? await smartParseImage(content, mimeType)
      : await smartParseText(content);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Parse failed" });
  }
});

// ── Route: parse uploaded document (base64) ────────────────────────────────

/**
 * POST /api/import/parse-document-base64
 * Body: { base64: string, filename: string, mimeType: string }
 * Extracts text from .docx / .pdf / .xlsx then runs smartParseText.
 */
router.post("/import/parse-document-base64", async (req: Request, res: Response) => {
  const { base64, filename = "upload", mimeType = "" } = req.body as {
    base64: string;
    filename: string;
    mimeType: string;
  };

  if (!base64) {
    res.status(400).json({ error: "No file data provided" });
    return;
  }

  const ext = filename.toLowerCase().split(".").pop() ?? "";
  const buffer = Buffer.from(base64, "base64");
  let extractedText = "";

  try {
    if (ext === "docx" || mimeType.includes("wordprocessingml") || mimeType.includes("msword")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.default.extractRawText({ buffer });
      extractedText = result.value;
    } else if (ext === "pdf" || mimeType.includes("pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfMod = (await import("pdf-parse")) as any;
      const pdfParseFn: (b: Buffer) => Promise<{ text: string }> = pdfMod.default ?? pdfMod;
      const result = await pdfParseFn(buffer);
      extractedText = result.text;
    } else if (ext === "xlsx" || ext === "xls" || ext === "csv" || mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buffer, { type: "buffer" });
      const texts: string[] = [];
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        if (!ws) continue;
        // Try JSON rows first for structured PMS exports
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
        if (rows.length === 1) {
          // Single row — treat as key-value BEO
          const row = rows[0] ?? {};
          texts.push(Object.entries(row).map(([k, v]) => `${k}: ${v}`).join("\n"));
        } else {
          texts.push(XLSX.utils.sheet_to_csv(ws));
        }
      }
      extractedText = texts.join("\n\n");
    } else if (ext === "txt" || mimeType.includes("text/plain")) {
      extractedText = buffer.toString("utf-8");
    } else {
      // Try as text
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText.trim()) {
      res.status(422).json({ error: "Could not extract text from this file. Try saving as PDF or Word format." });
      return;
    }

    const result = await smartParseText(extractedText);
    res.json({ ...result, extractedTextLength: extractedText.length });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Document parse failed" });
  }
});

export default router;
