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
 *
 * Terminology support:
 *   — Classic French culinary vocabulary (Brigade de Cuisine)
 *   — Australian & New Zealand hospitality English
 *   — Māori food vocabulary (Te Reo Māori)
 *   — Allergen inference from menu item names
 *   — HACCP critical control point awareness (FSANZ standard)
 */

import { Router, type IRouter, type Request, type Response } from "express";
import OpenAI from "openai";
import {
  assignPrepTeamAdvanced,
  normalizeTerminology,
  inferAllergens,
  generateHACCPNotes,
  detectTerminology,
  getHACCPNoteForDish,
  type AllergenFlag,
  type HACCPNote,
} from "../services/culinaryLexicon.js";

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
  prepItems: Array<{ team: string; dish: string; quantity: string; deadline: string; haccpNote?: string }>;
  confidence: Record<string, number>;
  aiUsed: boolean;
  // Enhanced fields from culinary lexicon analysis
  allergenWarnings: AllergenFlag[];
  haccpNotes: HACCPNote[];
  detectedTerminology: Array<{ term: string; language: string; meaning: string; category: string }>;
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
// Delegates to the culinary lexicon's advanced team assignment which understands
// French cooking methods, Māori ingredients, and AU/NZ food terminology.

function assignPrepTeam(item: string): string {
  return assignPrepTeamAdvanced(item);
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
    const haccpNote = getHACCPNoteForDish(dish) ?? undefined;
    return {
      team,
      dish,
      quantity: guestCount > 0 ? `${guestCount} portions` : "As required",
      deadline: prepDeadline(team, startTime),
      ...(haccpNote ? { haccpNote } : {}),
    };
  });
}

// ── Menu extraction ────────────────────────────────────────────────────────
// Extended COURSE_HEADERS includes French course names, NZ/AU smorgasbord,
// Māori kai terms, and classic hospitality abbreviations.

const COURSE_HEADERS: Array<{ re: RegExp; label: string }> = [
  // Reception / pre-dinner
  { re: /^(?:amuse[- ]?bouche|amuse[- ]gueule|reception\s+bites?|arrival\s+canapé[s]?|arrival\s+canape[s]?|pre[- ]?dinner\s+drinks?)/i, label: "Amuse-bouche" },
  { re: /^(?:canapé[s]?|canape[s]?|finger\s+food|pre[- ]?dinner|cocktail\s+food|party\s+food|nibbles?)/i,                               label: "Canapés" },

  // First course
  { re: /^(?:entr[ée]e?s?|starters?|first\s+course|appetizer[s]?|hors\s+d['']oeuvre)/i,                          label: "Entrée" },
  { re: /^(?:soup|bisque|consommé|consomme|velouté|veloute|broth|potage|chowder|gazpacho)/i,                      label: "Soup" },
  { re: /^(?:salad|salade|garden\s+salad|composed\s+salad|salade\s+composée)/i,                                   label: "Salad" },

  // Intermezzo
  { re: /^(?:intermezzo|palate\s+cleanser|granita\s+course|sorbet\s+intermezzo|trou\s+normand)/i,                 label: "Intermezzo" },

  // Main
  { re: /^(?:main[s]?|second\s+course|principal|mains?\s+course|plat[s]?\s+principal|main\s+event|primary\s+course)/i, label: "Main" },

  // Cheese
  { re: /^(?:cheese|fromage|cheese\s+board|plateau\s+de\s+fromages?|fromage\s+board)/i,                          label: "Cheese" },

  // Dessert
  { re: /^(?:dessert[s]?|sweet[s]?|pudding[s]?|third\s+course|pastry|gâteau|gateau|entremets|dolce|postres)/i,  label: "Dessert" },
  { re: /^(?:mignardise|petit\s+fours?|petits?\s+four|friandises?|tea\s+cookies?)/i,                             label: "Petit Fours" },

  // Supper
  { re: /^(?:supper|late\s+snack|midnight\s+snack|post[- ]?midnight)/i,                                          label: "Supper" },

  // Buffet
  { re: /^(?:buffet|smorgasbord|self[- ]?service|kai\s+buffet|carvery\s+station|action\s+station)/i,             label: "Buffet" },

  // High Tea
  { re: /^(?:high\s+tea|afternoon\s+tea|arvo\s+tea|cream\s+tea|devonshire\s+tea)/i,                              label: "High Tea" },

  // Bread
  { re: /^(?:bread[s]?\s+service|bread\s+rolls?|dinner\s+rolls?|bread\s+&\s+butter|pain)/i,                     label: "Bread" },

  // Beverage
  { re: /^(?:beverage[s]?|bar|drinks?|wine|champagne|beverages?\s+package|open\s+bar)/i,                         label: "Beverage" },

  // Māori / Pacific
  { re: /^(?:hāngī|hangi|kai\s+māori|kai\s+maori|traditional\s+feast|umu|earth\s+oven)/i,                       label: "Hāngī" },
];

function extractMenu(text: string): string[] {
  // First normalize terminology so French/Māori/AU terms are recognised
  const normalised = normalizeTerminology(text);
  const lines = normalised.split(/\n/).map((l) => l.trim());
  const menu: string[] = [];

  let currentCourse = "";
  let inMenuSection = false;

  // Check if there's a MENU section header
  const menuHeaderIdx = lines.findIndex((l) =>
    /^(?:MENU|FOOD\s+&\s+BEVERAGE|F&B|FOOD\s+MENU|CATERING\s+MENU|EVENT\s+MENU|FUNCTION\s+MENU|KAI|KAI\s+MENU|BUFFET\s+MENU)[\s:]*$/i.test(l)
  );
  const startIdx = menuHeaderIdx >= 0 ? menuHeaderIdx + 1 : 0;
  inMenuSection = menuHeaderIdx >= 0;

  const STOP_SECTIONS = /^(?:DIETARY|ALLERGEN|BEVERAGE|SERVICE|TIMELINE|SCHEDULE|TEAM|STAFF|NOTES?|SPECIAL|CONTACT|BILLING|PAYMENT|DEPOSIT|HACCP|TEMPERATURE|SAFETY)\b/i;

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
  // Normalize AU/NZ/Māori terminology before any pattern matching
  const normalised = normalizeTerminology(text);
  const lower = normalised.toLowerCase();
  const lines = normalised.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const conf: Record<string, number> = {};

  // Name
  let name = "";
  const namePats = [
    /^(?:function\s+name|event\s+name|booking\s+name|client\s+name|client|function|event|booking|subject|re|reference):\s*(.+)/im,
    /^(?:dear\s+\w+,?\s*\n+)([\w\s&']{4,60})/im,
  ];
  for (const p of namePats) {
    const m = normalised.match(p);
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
  const date = parseDate(normalised);
  if (date) conf["date"] = 90;

  // Times
  let startTime = "", endTime = "";
  const TRE = /\d{1,2}(?::\d{2})?\s*(?:[ap]m)?/i;
  const range = normalised.match(new RegExp(`(${TRE.source})\\s*(?:to|until|through|–|—|-)\\s*(${TRE.source})`, "i"));
  if (range) {
    const s = normaliseTime(range[1] ?? "");
    const e = normaliseTime(range[2] ?? "");
    if (s) { startTime = s; conf["startTime"] = 90; }
    if (e) { endTime = e; conf["endTime"] = 90; }
  } else {
    const sm = normalised.match(/(?:start(?:s|ing)?\s*(?:time)?:|commences?:|from\s+)((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i);
    if (sm) { const t = normaliseTime(sm[1] ?? ""); if (t) { startTime = t; conf["startTime"] = 80; } }
    const em = normalised.match(/(?:end(?:s|ing)?\s*(?:time)?:|finish(?:es)?:|close[sd]?:|concludes?:|until\s+)((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i);
    if (em) { const t = normaliseTime(em[1] ?? ""); if (t) { endTime = t; conf["endTime"] = 80; } }
  }

  // Guest count — understands pax, covers, guests, kaumātua (elders), tangata (people in Māori context)
  let guestCount = 0;
  const paxM =
    normalised.match(/(\d{1,4})\s*(?:pax|guests?|covers?|people|attendees?|persons?|heads?\b|tangata|kaumātua)/i) ||
    normalised.match(/(?:for|of)\s+(\d{1,4})\s*(?:pax|guests?|people|covers?)/i) ||
    normalised.match(/(?:capacity|attendance|numbers?):\s*(\d{1,4})/i);
  if (paxM) { guestCount = parseInt(paxM[1] ?? "0", 10); conf["guestCount"] = 85; }

  // Room
  let room = "";
  const roomPats = [
    /^(?:room|space|venue\s*space|function\s*room|wharenui|whare):\s*(.+)/im,
    /^(?:venue|location|held\s+at|held\s+in):\s*(.+)/im,
    /(?:in\s+the\s+)([\w\s]+(?:room|hall|ballroom|suite|lounge|terrace|function\s+room|marae|whare))\b/i,
    /(?:at\s+the\s+)([\w\s]+(?:ballroom|hall|suite|lounge|terrace|marae))\b/i,
  ];
  for (const p of roomPats) {
    const m = normalised.match(p);
    if (m?.[1]?.trim() && m[1].trim().length > 1) {
      room = m[1].trim().slice(0, 60);
      conf["room"] = 85;
      break;
    }
  }

  // Floor/level
  let floor = "";
  const floorM = normalised.match(/(level\s*\d+|ground\s+floor|lower\s+ground|mezzanine|first\s+floor|second\s+floor|third\s+floor|basement|\d+(?:st|nd|rd|th)\s+floor)/i);
  if (floorM) { floor = floorM[1]!.trim(); conf["floor"] = 80; }

  // Function type — extended with Māori/NZ terms
  let functionType = "A-la-carte";
  const typeMap: [string[], string][] = [
    [["cocktail party", "drinks function", "standing cocktail", "cocktail reception"], "Cocktail"],
    [["buffet", "smorgasbord", "self service", "self-service", "carvery", "smorgasbord", "action station"], "Buffet"],
    [["hāngī", "hangi", "hāngī feast", "hangi feast", "hāngī buffet", "traditional feast"], "Buffet"],
    [["high tea", "afternoon tea", "arvo tea", "high-tea", "cream tea", "devonshire tea"], "High Tea"],
    [["school ball", "school formal", "year 12", "formal dinner", "prom"], "School Ball"],
    [["canapés + a-la-carte", "canapes + a la carte", "canapé + a la carte", "canapés + ala carte"], "Canapés + A-la-carte"],
    [["canapé", "canape", "finger food", "canapés", "nibbles", "cocktail food"], "Canapés"],
    [["set menu", "prix fixe", "degustation", "tasting menu", "fixed menu", "dégustation"], "Set Menu"],
    [["cocktail"], "Cocktail"],
  ];
  for (const [keywords, type] of typeMap) {
    if (keywords.some((kw) => lower.includes(kw))) { functionType = type; conf["functionType"] = 80; break; }
  }

  // Dietary requirements — extended with AU/NZ/Māori dietary patterns
  const dietaryPatterns: Array<{ re: RegExp; label: string }> = [
    { re: /(\d+)\s*(?:x\s*)?(?:gluten[- ]?free|gf\b)/i,                         label: "Gluten Free" },
    { re: /\bgf\s*[x×:]\s*(\d+)|\b(\d+)\s*gf\b/i,                               label: "Gluten Free" },
    { re: /(\d+)\s*(?:x\s*)?vegan/i,                                              label: "Vegan" },
    { re: /(\d+)\s*(?:x\s*)?vegetarian/i,                                        label: "Vegetarian" },
    { re: /(\d+)\s*(?:x\s*)?dairy[- ]?free/i,                                    label: "Dairy Free" },
    { re: /(\d+)\s*(?:x\s*)?(?:nut|peanut|tree\s*nut)[- ]?allerg/i,             label: "Nut Allergy" },
    { re: /(\d+)\s*(?:x\s*)?shellfish[- ]?allerg/i,                              label: "Shellfish Allergy" },
    { re: /(\d+)\s*(?:x\s*)?halal/i,                                             label: "Halal" },
    { re: /(\d+)\s*(?:x\s*)?kosher/i,                                            label: "Kosher" },
    { re: /(\d+)\s*(?:x\s*)?egg[- ]?free/i,                                      label: "Egg Free" },
    { re: /(\d+)\s*(?:x\s*)?(?:low\s+fodmap|fodmap)/i,                          label: "Low FODMAP" },
    { re: /(\d+)\s*(?:x\s*)?(?:diabetic|low\s+sugar|sugar[- ]?free)/i,          label: "Diabetic Meal" },
    { re: /(\d+)\s*(?:x\s*)?(?:low\s+sodium|low\s+salt|salt[- ]?free)/i,        label: "Low Sodium" },
    { re: /(\d+)\s*(?:x\s*)?(?:pescatarian|pescetarian)/i,                       label: "Pescatarian" },
    { re: /(\d+)\s*(?:x\s*)?(?:soy[- ]?free|soy\s+allerg)/i,                   label: "Soy Free" },
    { re: /(\d+)\s*(?:x\s*)?(?:sesame[- ]?free|sesame\s+allerg)/i,              label: "Sesame Free" },
    { re: /(\d+)\s*(?:x\s*)?celiac/i,                                            label: "Coeliac (Gluten Free)" },
  ];
  const dietaryRequirements: ParsedFunctionData["dietaryRequirements"] = [];
  const seenDiet = new Set<string>();
  for (const { re, label } of dietaryPatterns) {
    if (seenDiet.has(label)) continue;
    const m = normalised.match(re);
    if (m) {
      const count = parseInt(m[1] ?? m[2] ?? "1", 10);
      dietaryRequirements.push({ name: label, count, note: "" });
      seenDiet.add(label);
    }
  }
  if (dietaryRequirements.length > 0) conf["dietary"] = 90;

  // Service events (course times) — extended with Māori/NZ course terminology
  const serviceEvents: ParsedFunctionData["serviceEvents"] = [];
  const coursePats: Array<{ re: RegExp; label: string }> = [
    { re: /(?:amuse[- ]?bouche|arrival\s+canapé[s]?)s?\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Amuse-bouche" },
    { re: /(?:entr[ée]e?s?|starters?|first\s+course)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,  label: "Entrée Away" },
    { re: /(?:soup|bisque|consommé|consomme|velouté)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,   label: "Soup Away" },
    { re: /(?:salad)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,                                   label: "Salad Away" },
    { re: /(?:main[s]?|second\s+course|mains?\s+course)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,label: "Main Away" },
    { re: /(?:dessert[s]?|sweet[s]?|third\s+course)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,   label: "Dessert Away" },
    { re: /(?:cheese|fromage)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,                          label: "Cheese Away" },
    { re: /(?:supper|late\s+snack)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,                    label: "Supper" },
    { re: /(?:buffet\s+open[s]?|buffet\s+service|smorgasbord\s+open[s]?)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Buffet Open" },
    { re: /(?:buffet\s+clos(?:e[sd]?|ing))\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,            label: "Buffet Closed" },
    { re: /(?:canapé[s]?|canape[s]?)\s*service?\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,       label: "Canapés Service" },
    { re: /(?:high\s+tea|tea\s+service|arvo\s+tea)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i,    label: "High Tea Served" },
    { re: /(?:hāngī|hangi)\s*(?:ready|open|serve[sd]?|lifted|lift)\s*[:\-–@at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Hāngī Lifted" },
  ];
  for (const { re, label } of coursePats) {
    const m = normalised.match(re);
    if (m?.[1]) {
      const t = normaliseTime(m[1]);
      if (t) serviceEvents.push({ time: t, label });
    }
  }
  serviceEvents.sort((a, b) => a.time.localeCompare(b.time));
  if (serviceEvents.length > 0) conf["serviceEvents"] = 80;

  // Special requirements
  const specialRequirements: string[] = [];
  const specialPats = [
    /(?:special\s+requirements?|special\s+notes?|client\s+notes?|instructions?):\s*(.+?)(?:\n|$)/gi,
    /(?:AV\s+requirements?|audio\s+visual|microphone|projector|screen|podium|stage).*?(?:\n|$)/gi,
    /(?:flowers?|florals?|centrepiece|decoration|theming).*?(?:\n|$)/gi,
    /(?:car\s+park|parking|valet|shuttle|transport).*?(?:\n|$)/gi,
    /(?:karakia|mihi|waiata|pōwhiri|powhiri).*?(?:\n|$)/gi, // Māori ceremony requirements
  ];
  for (const p of specialPats) {
    let m: RegExpExecArray | null;
    while ((m = p.exec(normalised)) !== null) {
      const item = (m[1] ?? m[0] ?? "").trim();
      if (item.length > 5 && item.length < 200) specialRequirements.push(item);
      if (specialRequirements.length >= 5) break;
    }
  }

  // Menu
  const menu = extractMenu(normalised);
  if (menu.length > 0) conf["menu"] = 80;

  // Prep items auto-generated from menu (with HACCP notes per item)
  const prepItems = generatePrepItems(menu, guestCount, startTime);

  // ── Culinary lexicon enrichment ──────────────────────────────────────────
  // Run allergen inference, HACCP note generation, and terminology detection
  // on the full text + extracted menu.
  const allergenWarnings = inferAllergens(menu);
  const haccpNotes = generateHACCPNotes(menu, functionType, guestCount);
  const detectedTerminology = detectTerminology(text); // original text, before normalization

  // If allergens inferred from menu items but not in declared dietary, add a warning note
  const inferredAllergens = new Set(allergenWarnings.flatMap((w) => w.allergens));
  const declaredAllergens = new Set(dietaryRequirements.map((d) => d.name.toLowerCase()));
  for (const allergen of inferredAllergens) {
    const matchesDeclared = [...declaredAllergens].some((d) => d.includes(allergen.toLowerCase().split(" ")[0] ?? ""));
    if (!matchesDeclared) {
      specialRequirements.push(`⚠ Auto-detected allergen risk: ${allergen} — verify with client and label dishes accordingly`);
    }
  }

  return {
    name, room, floor, date, functionType, startTime, endTime, guestCount,
    menu, serviceEvents, dietaryRequirements, specialRequirements, prepItems,
    confidence: conf,
    aiUsed: false,
    allergenWarnings,
    haccpNotes,
    detectedTerminology,
  };
}

// ── OpenAI system prompt ───────────────────────────────────────────────────
// Comprehensive professional kitchen AI prompt with multilingual culinary awareness.

const AI_SYSTEM = `You are a professional kitchen operations assistant specialising in Australian and New Zealand hospitality, with expertise in French classical cuisine, Pacific Island food culture, and FSANZ food safety standards.

Your task is to extract structured operational data from function sheets, BEOs (Banquet Event Orders), event briefs, menu cards, or catering documents.

Return ONLY valid JSON matching this exact TypeScript interface (no markdown fences, no explanation text — raw JSON only):
{
  "name": string,
  "room": string,
  "floor": string,
  "date": string, // YYYY-MM-DD or ""
  "functionType": string, // exactly one of: A-la-carte | Buffet | Cocktail | Canapés | Canapés + A-la-carte | School Ball | Set Menu | High Tea
  "startTime": string, // HH:MM or ""
  "endTime": string, // HH:MM or ""
  "guestCount": number,
  "menu": string[], // each item prefixed with course: "Entrée: Sesame Tuna", "Main: Beef Tenderloin"
  "serviceEvents": [{ "time": string, "label": string }],
  "dietaryRequirements": [{ "name": string, "count": number, "note": string }],
  "specialRequirements": string[],
  "prepItems": [{ "team": "Hot Kitchen"|"Cold Larder"|"Pastry"|"Function Team", "dish": string, "quantity": string, "deadline": string, "haccpNote": string }],
  "allergenWarnings": [{ "dish": string, "allergens": string[], "severity": "definite"|"likely"|"possible", "note": string }],
  "haccpNotes": [{ "rule": string, "priority": "critical"|"major"|"minor", "minTemp": number|null, "context": string }],
  "detectedTerminology": [{ "term": string, "language": string, "meaning": string, "category": string }]
}

══════════════════════════════════════════════════════════════════════════
MULTILINGUAL CULINARY TERMINOLOGY — Recognise and correctly interpret:
══════════════════════════════════════════════════════════════════════════

FRENCH CLASSICAL (Brigade de Cuisine standard):
• Course names: amuse-bouche (one-bite appetiser), entrée (starter), plat principal (main), fromage (cheese), entremets (between-course sweet), mignardise (petit fours)
• Techniques: mise en place (prep), sauté (high-heat pan fry), braisé (braised), confit (slow fat-cooked), sous vide (vacuum water bath), bain-marie (water bath holding), flambé (flamed), en papillote (parchment parcel), au gratin (breadcrumb/cheese topped and browned), en croûte (pastry encased), monter au beurre (butter-finish gloss), blanchir (blanch-shock)
• Cuts: brunoise (2mm dice), julienne (1mm matchsticks), chiffonade (fine shredded leaf), paysanne (flat irregular), tourné (7-sided barrel)
• Sauces: beurre blanc (butter/shallot/wine — contains DAIRY), hollandaise (butter/egg — contains DAIRY+EGG), béarnaise (hollandaise+tarragon — contains DAIRY+EGG), velouté (stock+roux — contains GLUTEN), béchamel (milk+roux — contains DAIRY+GLUTEN), espagnole (brown roux — contains GLUTEN), demi-glace (reduced brown stock), beurre noisette (browned butter — contains DAIRY), gastrique (sugar/vinegar), coulis (smooth purée), jus lié (thickened jus)
• Classic dishes: bisque (shellfish cream soup — SHELLFISH+DAIRY), consommé (clarified broth), bouillabaisse (fish stew — FISH+SHELLFISH), coq au vin (chicken braised in wine — SULPHITES), boeuf bourguignon (beef in Burgundy — SULPHITES), blanquette (white veal stew — DAIRY+GLUTEN), quenelle (poached fish mousse — FISH+EGG+DAIRY), galantine (stuffed poultry roll — POULTRY 74°C), carpaccio (raw protein — CCP: 2°C, serve within 2h), tartare (raw chopped protein — CCP: declare on menu, 2°C)
• Desserts: crème brûlée (set custard — DAIRY+EGG), panna cotta (set cream — DAIRY), soufflé (egg white risen — EGG+DAIRY+GLUTEN), profiterole (choux — GLUTEN+DAIRY+EGG), mille-feuille (puff pastry layers — GLUTEN+DAIRY+EGG), tarte tatin (caramel apple tart — GLUTEN+DAIRY+EGG), croquembouche (choux tower — GLUTEN+DAIRY+EGG)

MĀORI / TE REO MĀORI food vocabulary:
• kai = food • kaimoana = seafood (declare FISH+SHELLFISH) • hāngī/hangi = earth oven feast (poultry 74°C+, pork 71°C+, beef/lamb 63°C+) • kūmara/kumara = sweet potato • rewena = Māori potato sourdough bread (contains GLUTEN) • pūhā/puha = sow thistle leaf • mānuka/manuka = tea tree (honey or smoking wood) • horopito = NZ bush pepper • kawakawa = NZ aromatic pepper leaf • pikopiko = native fern fronds • pāua/paua = NZ abalone (SHELLFISH — hold live at 10-14°C, serve ≤2°C) • kina = NZ sea urchin (SHELLFISH — serve same-day, hold ≤2°C) • tūatua/tuatua = NZ surf clam (SHELLFISH — cook to 63°C, discard closed shells) • koura = freshwater crayfish (SHELLFISH) • wheke = octopus (SHELLFISH) • ika = fish (declare FISH allergen) • taro = taro root (MUST be fully cooked — raw contains oxalate crystals)

AUSTRALIAN & NEW ZEALAND hospitality English:
• chook = chicken (cook to 74°C+ core) • snags/sausages (cook to 71°C+ throughout) • capsicum = bell pepper • rockmelon = cantaloupe • beetroot = beet • silverbeet = Swiss chard • barramundi = Australian sea bass (FISH) • bugs = Balmain/Moreton Bay bugs = flat lobster (SHELLFISH) • yabbies = freshwater crayfish (SHELLFISH) • marron = WA freshwater crayfish (SHELLFISH) • mud crab (SHELLFISH) • pipis = surf clams (SHELLFISH) • witlof = Belgian endive • brekky/brekkie = breakfast • arvo tea = afternoon tea • smorgasbord = buffet (very common in NZ) • pax = guest count • covers = servings • BEO = Banquet Event Order • bump in = venue setup • bump out = venue packdown
• Native Australian ingredients: wattleseed (coffee-nutty), finger lime (citrus pearls), lemon myrtle (aromatic leaf), quandong (desert peach), kakadu plum (very high vitamin C), davidson plum (sour), riberry (lilly pilly berry), bush tomato (intense flavour), muntries (cranberry-like)

══════════════════════════════════════════════════════════════════════════
ALLERGEN INFERENCE RULES — Auto-detect from dish names:
══════════════════════════════════════════════════════════════════════════
When you see dish names, infer likely allergens even if not stated. Add to allergenWarnings:
• GLUTEN: pasta, bread, pastry (any type), tempura, beer batter, croutons, soy sauce (standard), miso, au gratin, béchamel, roux-based sauces, breaded/crumbed/schnitzel, Wellington/en croûte, quiche, tart, cake, muffin, brownie
• DAIRY: cream, butter, cheese (all types), béchamel, hollandaise, béarnaise, beurre blanc, crème brûlée, panna cotta, risotto (finished), gratin, tiramisu, cheesecake, ice cream
• EGG: hollandaise, béarnaise, mayonnaise, aioli, Caesar dressing, soufflé, meringue, pavlova, crème brûlée, custard, quiche, carbonara, tempura, fresh pasta
• FISH: any fin fish (salmon, tuna, snapper, barramundi, ika, etc.), anchovies, Worcestershire sauce, Caesar dressing, fumet, fish sauce, nam pla, gravlax, sashimi
• SHELLFISH: prawns, lobster, bugs, crab, scallops, oysters, mussels, clams/pipis, squid/calamari, pāua, kina, tūatua, bisque, laksa, tom yum, shrimp paste
• PEANUTS: satay sauce, pad thai, gado gado, peanut sauce — SEVERE ALLERGY RISK
• TREE NUTS: pesto (pine nuts), praline, baklava, waldorf (walnuts), romesco, dukkah, marzipan, frangipane, financier, pistachio ice cream, almond cake
• SESAME: tahini, hummus, dukkah, sesame oil, Japanese dressings, gomae, Middle Eastern dishes
• SOY: tofu, edamame, miso, tempeh, soy sauce, teriyaki, hoisin, black bean paste
• SULPHITES: all wine (red/white/rosé/sparkling), dried fruit, some sausages/deli meats, vinegar
• CELERY: celery salt, mirepoix (check), stock cubes (often contain celery extract)
• MUSTARD: dijon, grain mustard, hot English mustard — any mustard dressing or coating

══════════════════════════════════════════════════════════════════════════
HACCP CRITICAL CONTROL POINTS — Include in haccpNotes and prepItem.haccpNote:
══════════════════════════════════════════════════════════════════════════
FSANZ / MPI (NZ) aligned safe minimum internal temperatures:
• Poultry (chicken/chook, duck, turkey, quail): 74°C+ at thickest point — NO exceptions
• Ground/minced meat: 71°C+ throughout
• Whole pork cuts: 71°C+ (or 63°C+3min rest)
• Whole beef/lamb/venison: 63°C+3min rest (medium-rare is safe at this temp+rest)
• Seafood/fish: 63°C+ (unless certified sushi-grade raw)
• Shellfish/molluscs: 63°C+ (closed shells must be discarded)
• Eggs (hot dishes): 74°C+ if serving to immune-compromised, elderly, pregnant, or children
• Reheated food: 74°C+ — reheat ONCE ONLY
• Hollandaise/béarnaise: Make fresh, hold 60-65°C, max 2 hours, NEVER cool and reheat
• Sous vide: Log all times/temps against pasteurisation tables; blast chill immediately
• Buffet/bain-marie hot food: ≥63°C checked every 30 min, log times
• Cooling: 60°C→21°C within 2 hours, then 21°C→5°C within 4 hours (blast chiller preferred)
• Raw protein (tartare/carpaccio): Hold ≤2°C, serve within 2h, must declare on menu
• Hāngī: Probe all proteins — poultry 74°C+, pork 71°C+, beef/lamb 63°C+

PREP TEAM ASSIGNMENT:
• Hot Kitchen: sauté, braisé, rôti, grillé, poché, sous vide, confit, flambé, soups, hot mains, sauces
• Cold Larder: salads, carpaccio, tartare, sashimi, ceviche, terrines, cold smoked, cheese boards, cold entrées, cold dessert components (not plated)
• Pastry: all plated desserts, cake, tart, pastry, ice cream/gelato/sorbet, petit fours, bread service, viennoiserie
• Function Team: canapés, amuse-bouche, blinis, bruschetta, crostini, bread rolls for table, reception food, cocktail bites

PORTION/QUANTITY GUIDANCE:
• Canapé functions: 4-6 pieces per person per hour of service
• Soup/consommé: 200-250mL per cover
• Plated entrée: 120-150g protein component
• Plated main: 180-220g protein + 100g vegetable + 80-100g starch
• Dessert: 100-120g plated portion
• Petit fours/mignardise: 3-4 pieces per cover

RULES:
- Extract ALL menu items with their course prefix
- Generate realistic prep items with actual clock deadlines (e.g. "13:45") calculated from service start
- For dietary requirements, extract counts from text (e.g. "3 × Gluten Free" → count: 3)
- functionType must exactly match one of the allowed values
- allergenWarnings: list dishes where allergens are inferred from the dish name alone — be thorough
- haccpNotes: list critical control points relevant to the menu/function type — prioritise critical items first
- detectedTerminology: list ALL French, Māori, and AU/NZ terms found in the text
- If a field is not present in the source document, use "" or [] or 0 as appropriate
- Never fabricate guest names, prices, or contact details not in the source`;

async function parseWithAI(text: string): Promise<ParsedFunctionData> {
  if (!openai) throw new Error("AI not available");

  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: AI_SYSTEM },
      { role: "user", content: `Parse this function sheet and return structured kitchen operations JSON:\n\n${text}` },
    ],
    temperature: 0.1,
    max_tokens: 3500,
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
    allergenWarnings: Array.isArray(data.allergenWarnings) ? data.allergenWarnings : [],
    haccpNotes: Array.isArray(data.haccpNotes) ? data.haccpNotes : [],
    detectedTerminology: Array.isArray(data.detectedTerminology) ? data.detectedTerminology : [],
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
          { type: "text", text: "Extract all function sheet and kitchen operations data from this document image. Return structured JSON:" },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" } },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 3500,
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
    allergenWarnings: Array.isArray(data.allergenWarnings) ? data.allergenWarnings : [],
    haccpNotes: Array.isArray(data.haccpNotes) ? data.haccpNotes : [],
    detectedTerminology: Array.isArray(data.detectedTerminology) ? data.detectedTerminology : [],
  };
}

// ── Smart parse orchestrators ──────────────────────────────────────────────

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
    prepItems: [],
    confidence: {},
    aiUsed: false,
    allergenWarnings: [],
    haccpNotes: [],
    detectedTerminology: [],
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
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
        if (rows.length === 1) {
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
