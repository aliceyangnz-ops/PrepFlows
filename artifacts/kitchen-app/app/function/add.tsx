import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DietaryRequirement, FunctionType, KitchenFunction, getAccessLevel, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

const FUNCTION_TYPES: FunctionType[] = [
  "A-la-carte", "Set Menu", "Buffet", "Cocktail",
  "Canapés", "Canapés + A-la-carte", "School Ball", "High Tea",
];

function getFunctionTypeColor(type: FunctionType): string {
  switch (type) {
    case "A-la-carte":           return "#F59E0B";
    case "Buffet":               return "#3B82F6";
    case "Cocktail":             return "#8B5CF6";
    case "Canapés":              return "#22C55E";
    case "Canapés + A-la-carte": return "#F97316";
    case "School Ball":          return "#EC4899";
    case "Set Menu":             return "#14B8A6";
    case "High Tea":             return "#F43F5E";
    default:                     return "#6B7A94";
  }
}

function getDietaryColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gluten"))   return "#22C55E";
  if (n.includes("vegan"))    return "#84CC16";
  if (n.includes("vegetarian")) return "#4ADE80";
  if (n.includes("nut"))      return "#F59E0B";
  if (n.includes("dairy"))    return "#60A5FA";
  if (n.includes("shellfish") || n.includes("seafood")) return "#F97316";
  if (n.includes("halal"))    return "#14B8A6";
  if (n.includes("kosher"))   return "#8B5CF6";
  if (n.includes("egg"))      return "#FCD34D";
  return "#94A3B8";
}

// ── Smart parser ──────────────────────────────────────────────────────────────

function normalizeTime(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (s === "noon" || s === "midday") return "12:00";
  if (s === "midnight") return "00:00";
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?([ap]m)?$/);
  if (!m) return raw.trim();
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  const ampm = m[3];
  if (ampm === "pm" && h !== 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

interface ParseResult {
  name: string;
  room: string;
  floor: string;
  functionType: FunctionType;
  startTime: string;
  endTime: string;
  guestCount: string;
  serviceEvents: Array<{ time: string; label: string }>;
  dietaryRequirements: Array<{ name: string; count: string; note: string }>;
  confidence: Record<string, boolean>;
}

function parseEventText(raw: string): ParseResult {
  const text = raw;
  const lower = raw.toLowerCase();
  const lines = raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const confidence: Record<string, boolean> = {};

  // ── GUEST COUNT ─────────────────────────────────────────────────────────
  let guestCount = "";
  const guestMatch =
    text.match(/(\d{1,4})\s*(?:pax|guests?|covers?|people|attendees?|persons?|head\b)/i) ||
    text.match(/(?:for|of)\s+(\d{1,4})\s*(?:pax|guests?|people|\b)/i) ||
    text.match(/capacity:?\s*(\d{1,4})/i);
  if (guestMatch) { guestCount = guestMatch[1]; confidence.guestCount = true; }

  // ── TIMES ────────────────────────────────────────────────────────────────
  let startTime = "", endTime = "";
  const TIME = /\d{1,2}(?::\d{2})?\s*(?:[ap]m)?/i;
  const rangeMatch = text.match(
    new RegExp(`(${TIME.source})\\s*(?:to|until|–|—|-|through)\\s*(${TIME.source})`, "i")
  );
  if (rangeMatch) {
    startTime = normalizeTime(rangeMatch[1]);
    endTime   = normalizeTime(rangeMatch[2]);
    confidence.startTime = true; confidence.endTime = true;
  } else {
    const s = text.match(/(?:start(?:s|ing)?(?:\s*time)?:?\s*|commences?:?\s*|from\s+)((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i);
    if (s) { startTime = normalizeTime(s[1]); confidence.startTime = true; }
    const e = text.match(/(?:end(?:s|ing)?(?:\s*time)?:?\s*|finish(?:es)?:?\s*|close[sd]?:?\s*|concludes?:?\s*)((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i);
    if (e) { endTime = normalizeTime(e[1]); confidence.endTime = true; }
  }

  // ── COURSE / SERVICE TIMES → serviceEvents ───────────────────────────────
  const courseMatches: Array<{ time: string; label: string }> = [];
  const coursePats: Array<{ re: RegExp; label: string }> = [
    { re: /(?:amuse|amuse[-\s]bouche|canapé arrival|arrival\s+drink[s]?)\s*[:\-–at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Amuse-bouche" },
    { re: /(?:entr[ée]e?s?|starter[s]?|first\s+course)\s*[:\-–at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Entrée Away" },
    { re: /(?:soup|bisque|consommé)\s*[:\-–at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Soup Away" },
    { re: /(?:main[s]?|second\s+course|mains?\s+course)\s*[:\-–at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Main Away" },
    { re: /(?:dessert[s]?|sweet[s]?|pudding|third\s+course)\s*[:\-–at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Dessert Away" },
    { re: /(?:supper|late\s+snack)\s*[:\-–at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Supper" },
    { re: /(?:buffet\s+open[s]?|buffet\s+service)\s*[:\-–at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Buffet Open" },
    { re: /(?:buffet\s+clos(?:e[sd]?|ing))\s*[:\-–at]*\s*((?:\d{1,2})(?::\d{2})?\s*(?:[ap]m)?)/i, label: "Buffet Closed" },
  ];
  for (const { re, label } of coursePats) {
    const m = text.match(re);
    if (m) courseMatches.push({ time: normalizeTime(m[1]), label });
  }
  courseMatches.sort((a, b) => a.time.localeCompare(b.time));
  if (courseMatches.length > 0) confidence.serviceEvents = true;

  // ── FUNCTION TYPE ────────────────────────────────────────────────────────
  let functionType: FunctionType = "A-la-carte";
  const typeMap: [string[], FunctionType][] = [
    [["cocktail", "cocktail party", "drinks function", "standing cocktail"], "Cocktail"],
    [["buffet", "smorgasbord", "self service", "self-service"], "Buffet"],
    [["high tea", "afternoon tea", "high-tea"], "High Tea"],
    [["school ball", "school formal", "year 12", "prom", "formal dinner"], "School Ball"],
    [["canapés + a-la-carte", "canapes + a la carte", "canapé + a la carte"], "Canapés + A-la-carte"],
    [["canapé", "canape", "finger food", "canapés", "canapes"], "Canapés"],
    [["set menu", "prix fixe", "degustation", "tasting menu", "fixed menu"], "Set Menu"],
    [["wedding", "reception", "sit down", "plated dinner", "plated lunch", "a la carte", "a-la-carte"], "A-la-carte"],
  ];
  for (const [keywords, type] of typeMap) {
    if (keywords.some((kw) => lower.includes(kw))) { functionType = type; confidence.functionType = true; break; }
  }

  // ── ROOM ─────────────────────────────────────────────────────────────────
  let room = "";
  const roomPats = [
    /^room:?\s*(.+)/im,
    /^venue:?\s*(.+)/im,
    /location:?\s*(.+)/i,
    /held\s+(?:at|in)\s+(?:the\s+)?(.+?)(?:\.|,|$)/i,
    /(?:in\s+the\s+)([\w\s]+(?:room|hall|ballroom|suite|lounge|terrace|function\s+room))/i,
    /(?:at\s+)([\w\s]+(?:ballroom|suite|lounge|hall|terrace))/i,
  ];
  for (const p of roomPats) {
    const m = text.match(p);
    if (m && m[1].trim().length > 1) { room = m[1].trim().slice(0, 50); confidence.room = true; break; }
  }

  // ── FLOOR / LEVEL ────────────────────────────────────────────────────────
  let floor = "";
  const floorMatch = text.match(
    /(level\s*\d+|ground\s+floor|lower\s+ground|mezzanine|first\s+floor|second\s+floor|third\s+floor|basement|\d+(?:st|nd|rd|th)\s+floor)/i
  );
  if (floorMatch) { floor = floorMatch[1].trim(); confidence.floor = true; }

  // ── NAME ─────────────────────────────────────────────────────────────────
  let name = "";
  const namePats = [
    /^(?:function\s+name|event\s+name|booking\s+name|client|function|event):?\s*(.+)/im,
    /^(?:subject|re):?\s*(.+)/im,
  ];
  for (const p of namePats) {
    const m = text.match(p);
    if (m && m[1].trim().length > 2) { name = m[1].trim().slice(0, 80); confidence.name = true; break; }
  }
  if (!name) {
    for (const line of lines) {
      if (
        line.length >= 4 && line.length <= 80 &&
        !/^(?:dear|hi |hello|from:|to:|date:|time:|room:|guests?:|pax:|dietary:|dietary requirements|level|floor|start|end|finish|tel:|phone:|email:|http)/i.test(line) &&
        !/^\d{1,2}[:/]\d{0,2}/.test(line) &&
        !/^\d+\s*(?:pax|guests?|covers?)/.test(line)
      ) {
        name = line.slice(0, 80);
        confidence.name = true;
        break;
      }
    }
  }

  // ── DIETARY REQUIREMENTS ─────────────────────────────────────────────────
  const dietaryPatterns: { re: RegExp; label: string }[] = [
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?(?:(?:are|is)\s+)?(?:gluten[\s-]?free|GF\b)/i,  label: "Gluten Free" },
    { re: /\bGF\s*[x×:]\s*(\d+)|\b(\d+)\s*GF\b/i,                                           label: "Gluten Free" },
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?(?:(?:are|is)\s+)?vegan/i,                       label: "Vegan" },
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?(?:(?:are|is)\s+)?vegetarian/i,                  label: "Vegetarian" },
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?(?:(?:have|has|with)\s+)?(?:nut|peanut|tree\s*nut)[\s-]?allerg/i, label: "Nut Allergy" },
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?(?:(?:are|is)\s+)?dairy[\s-]?free/i,             label: "Dairy Free" },
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?(?:(?:are|is)\s+)?halal/i,                       label: "Halal" },
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?(?:(?:have|has|with)\s+)?shellfish[\s-]?allerg/i, label: "Shellfish Allergy" },
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?(?:(?:are|is)\s+)?kosher/i,                      label: "Kosher" },
    { re: /(\d+)\s*(?:x\s*)?(?:guests?\s+)?egg[\s-]?free/i,                                  label: "Egg Free" },
  ];
  const dietaryRequirements: Array<{ name: string; count: string; note: string }> = [];
  const seen = new Set<string>();
  for (const { re, label } of dietaryPatterns) {
    if (seen.has(label)) continue;
    const m = text.match(re);
    if (m) {
      const count = m[1] || m[2] || "1";
      dietaryRequirements.push({ name: label, count, note: "" });
      seen.add(label);
    }
  }
  if (dietaryRequirements.length > 0) confidence.dietary = true;

  return { name, room, floor, functionType, startTime, endTime, guestCount, serviceEvents: courseMatches, dietaryRequirements, confidence };
}

// ── Component ──────────────────────────────────────────────────────────────

type Tab = "import" | "manual";

interface FormState {
  name: string;
  room: string;
  floor: string;
  functionType: FunctionType;
  startTime: string;
  endTime: string;
  guestCount: string;
  serviceEvents: Array<{ time: string; label: string }>;
  dietaryRequirements: Array<{ name: string; count: string; note: string }>;
}

const EMPTY_FORM: FormState = {
  name: "", room: "", floor: "", functionType: "A-la-carte",
  startTime: "", endTime: "", guestCount: "",
  serviceEvents: [],
  dietaryRequirements: [],
};

const PLACEHOLDER = `Paste your function sheet or email here.

Examples of what this can read:

  Smith Wedding Reception
  Room: Ballroom A, Level 1
  Saturday 10 May 2026
  6:30pm to 11:00pm
  180 guests
  Entrée: 7:00pm  Main: 8:30pm  Dessert: 9:30pm
  Dietary: 8 GF, 3 vegan, 2 nut allergy, 1 halal

  ---

  Corporate Gala Dinner — ABC Company
  Grand Ballroom, Ground Floor
  Cocktail function, 250 pax
  Start: 7pm  Finish: 10:30pm`;

export default function AddFunctionScreen() {
  const colors   = useColors();
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const { addFunction, currentStaffId, staff } = useKitchen();
  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const isManager = currentMember ? getAccessLevel(currentMember) === "manager" : false;
  const topPad   = Platform.OS === "web" ? 67 : insets.top;
  const scrollRef = useRef<ScrollView>(null);

  const [tab, setTab]             = useState<Tab>("import");
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed]       = useState<ParseResult | null>(null);
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);

  if (!isManager) {
    const noAccessStyles = StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 32 },
      title: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 20, textAlign: "center" },
      sub: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 10, textAlign: "center", lineHeight: 22 },
      btn: { marginTop: 24, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
      btnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    });
    return (
      <View style={noAccessStyles.root}>
        <Ionicons name="lock-closed" size={48} color={colors.mutedForeground} />
        <Text style={noAccessStyles.title}>Manager access only</Text>
        <Text style={noAccessStyles.sub}>
          Only managers can add events. Sign in as a manager on the Roster tab to continue.
        </Text>
        <Pressable style={noAccessStyles.btn} onPress={() => router.back()}>
          <Text style={noAccessStyles.btnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const TYPE_MILESTONE_TEMPLATES: Record<FunctionType, Array<{ time: string; label: string }>> = {
    "A-la-carte":           [{ time: "", label: "Entrée Away" }, { time: "", label: "Main Away" }, { time: "", label: "Dessert Away" }],
    "Set Menu":             [{ time: "", label: "Entrée Away" }, { time: "", label: "Main Away" }, { time: "", label: "Dessert Away" }],
    "Buffet":               [{ time: "", label: "Buffet Open" }, { time: "", label: "Buffet Closed" }],
    "Cocktail":             [{ time: "", label: "Canapés Service" }, { time: "", label: "Cocktail Hour Ends" }],
    "Canapés":              [{ time: "", label: "Canapés Service" }],
    "Canapés + A-la-carte": [{ time: "", label: "Canapés Service" }, { time: "", label: "Entrée Away" }, { time: "", label: "Main Away" }],
    "School Ball":          [{ time: "", label: "Entrée Away" }, { time: "", label: "Main Away" }, { time: "", label: "Dessert Away" }, { time: "", label: "Supper" }],
    "High Tea":             [{ time: "", label: "High Tea Served" }, { time: "", label: "Sandwiches Away" }, { time: "", label: "Scones Away" }, { time: "", label: "Sweets Away" }],
  };

  function handleFunctionTypeChange(type: FunctionType) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setForm((f) => ({
      ...f,
      functionType: type,
      serviceEvents: f.serviceEvents.length === 0 ? TYPE_MILESTONE_TEMPLATES[type] : f.serviceEvents,
    }));
  }

  function handleParse() {
    if (!pasteText.trim()) {
      Alert.alert("Nothing to read", "Please paste some text first.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = parseEventText(pasteText);
    setParsed(result);
    setForm({
      name:         result.name,
      room:         result.room,
      floor:        result.floor,
      functionType: result.functionType,
      startTime:    result.startTime,
      endTime:      result.endTime,
      guestCount:   result.guestCount,
      serviceEvents: result.serviceEvents,
      dietaryRequirements: result.dietaryRequirements,
    });
    setTimeout(() => scrollRef.current?.scrollTo({ y: 340, animated: true }), 150);
  }

  function handleClearImport() {
    setPasteText("");
    setParsed(null);
    setForm(EMPTY_FORM);
  }

  function handleSave() {
    if (!isManager) {
      Alert.alert("Access denied", "Only managers can add new events.");
      return;
    }
    const guestNum = parseInt(form.guestCount, 10);
    if (!form.name.trim()) {
      Alert.alert("Missing name", "Please enter a function name."); return;
    }
    if (!form.room.trim()) {
      Alert.alert("Missing room", "Please enter the room or venue."); return;
    }
    if (!form.startTime) {
      Alert.alert("Missing start time", "Please enter a start time (e.g. 18:30)."); return;
    }
    if (isNaN(guestNum) || guestNum < 1) {
      Alert.alert("Invalid guest count", "Please enter a valid number of guests."); return;
    }

    const id = `fn_${Date.now()}`;
    const newFn: KitchenFunction = {
      id,
      name:         form.name.trim(),
      room:         form.room.trim(),
      floor:        form.floor.trim() || "Ground Floor",
      functionType: form.functionType,
      startTime:    form.startTime,
      endTime:      form.endTime || form.startTime,
      guestCount:   guestNum,
      status:       "upcoming",
      dietaryRequirements: form.dietaryRequirements
        .filter((d) => d.name.trim() && parseInt(d.count, 10) > 0)
        .map((d) => ({ name: d.name.trim(), count: parseInt(d.count, 10), note: d.note })),
      serviceEvents: form.serviceEvents
        .filter((e) => e.time.trim() && e.label.trim())
        .sort((a, b) => a.time.localeCompare(b.time)),
      menu: [],
      teamIds: [],
      timeline: [],
    };

    addFunction(newFn);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Event added",
      `${form.name} has been added to today's events. Open it to add the run sheet, menu, and team.`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  }

  const foundCount = parsed ? Object.values(parsed.confidence).filter(Boolean).length : 0;

  const s = StyleSheet.create({
    root:        { flex: 1, backgroundColor: colors.background },
    toolbar:     { paddingTop: topPad + 10, paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
    toolbarTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    saveBtn:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.accent },
    saveBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
    tabBar:      { flexDirection: "row", marginHorizontal: 20, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: "hidden", backgroundColor: colors.card },
    tabBtn:      { flex: 1, paddingVertical: 11, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
    tabBtnText:  { fontSize: 13, fontFamily: "Inter_700Bold" },

    // Import tab
    importHero:  { marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: colors.radius, backgroundColor: colors.primary + "15", borderWidth: 1.5, borderColor: colors.primary + "50" },
    importTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primary, marginBottom: 4 },
    importSub:   { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 20 },
    textArea:    { marginHorizontal: 20, marginTop: 12, borderRadius: colors.radius, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, padding: 14, minHeight: 200, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22, textAlignVertical: "top" },
    parseBtn:    { marginHorizontal: 20, marginTop: 12, borderRadius: colors.radius, paddingVertical: 15, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    parseBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    clearBtn:    { marginHorizontal: 20, marginTop: 8, borderRadius: colors.radius, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
    clearBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },

    // Parse result banner
    resultBanner: { marginHorizontal: 20, marginTop: 16, padding: 14, borderRadius: colors.radius, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1 },
    resultBannerText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },

    // Section
    sectionLabel: { marginHorizontal: 20, marginTop: 22, marginBottom: 8, fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1 },
    card:        { marginHorizontal: 20, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: "hidden" },
    fieldRow:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 54 },
    fieldLabel:  { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, width: 90 },
    fieldInput:  { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 12 },
    fieldInputFilled: { color: colors.primary },
    missingDot:  { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#EF4444", marginLeft: 6 },

    typeWrap:    { padding: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 },
    typeChip:    { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, borderWidth: 1.5, flexDirection: "row", alignItems: "center", gap: 5 },
    typeChipText: { fontSize: 13, fontFamily: "Inter_700Bold" },

    courseToggle: { marginHorizontal: 20, marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 },
    courseToggleText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.info, flex: 1 },

    dietaryRow:  { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 },
    dietaryInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dietaryColorDot: { width: 10, height: 10, borderRadius: 5 },
    dietaryNameInput: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 4 },
    dietaryCountInput: { width: 52, fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
    dietaryNoteInput: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, paddingTop: 2 },
    addDietaryBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
    addDietaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primary },

    bottomPad:   { height: Platform.OS === "web" ? 80 : insets.bottom + 100 },
  });

  function renderFormFields(showMissingDots: boolean) {
    return (
      <>
        {/* Basic details */}
        <Text style={s.sectionLabel}>Basic Details</Text>
        <View style={s.card}>
          {([
            { key: "name",       label: "Event name",   placeholder: "e.g. Smith Wedding Reception", keyboard: "default" as const },
            { key: "room",       label: "Room / Venue",  placeholder: "e.g. Ballroom A",              keyboard: "default" as const },
            { key: "floor",      label: "Floor / Level", placeholder: "e.g. Level 1, Ground Floor",   keyboard: "default" as const },
            { key: "guestCount", label: "Guests",        placeholder: "e.g. 280",                     keyboard: "number-pad" as const },
          ] as const).map(({ key, label, placeholder, keyboard }, idx, arr) => {
            const val = form[key as keyof FormState] as string;
            const isMissing = showMissingDots && !val;
            return (
              <View key={key} style={[s.fieldRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={s.fieldLabel}>{label}</Text>
                <TextInput
                  style={[s.fieldInput, val && s.fieldInputFilled]}
                  value={val}
                  onChangeText={(v) => updateForm(key as keyof FormState, v)}
                  placeholder={placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType={keyboard}
                />
                {isMissing && <View style={s.missingDot} />}
              </View>
            );
          })}
        </View>

        {/* Times */}
        <Text style={s.sectionLabel}>Service Times</Text>
        <View style={s.card}>
          {([
            { key: "startTime", label: "Start time",   placeholder: "18:30" },
            { key: "endTime",   label: "Finish time",  placeholder: "23:00" },
          ] as const).map(({ key, label, placeholder }, idx, arr) => {
            const val = form[key as keyof FormState] as string;
            const isMissing = showMissingDots && key === "startTime" && !val;
            return (
              <View key={key} style={[s.fieldRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={s.fieldLabel}>{label}</Text>
                <TextInput
                  style={[s.fieldInput, val && s.fieldInputFilled]}
                  value={val}
                  onChangeText={(v) => updateForm(key as keyof FormState, v)}
                  placeholder={placeholder}
                  placeholderTextColor={colors.mutedForeground}
                />
                {isMissing && <View style={s.missingDot} />}
              </View>
            );
          })}
        </View>

        {/* Function type */}
        <Text style={s.sectionLabel}>Function Type</Text>
        <View style={[s.card]}>
          <View style={s.typeWrap}>
            {FUNCTION_TYPES.map((type) => {
              const ftc = getFunctionTypeColor(type);
              const selected = form.functionType === type;
              return (
                <Pressable
                  key={type}
                  style={[s.typeChip, { backgroundColor: selected ? ftc + "25" : "transparent", borderColor: selected ? ftc : colors.border }]}
                  onPress={() => handleFunctionTypeChange(type)}
                >
                  {selected && <Feather name="check" size={12} color={ftc} />}
                  <Text style={[s.typeChipText, { color: selected ? ftc : colors.mutedForeground }]}>{type}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Service milestones */}
        <Text style={s.sectionLabel}>Service Milestones <Text style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(optional)</Text></Text>
        <View style={s.card}>
          {form.serviceEvents.map((evt, idx) => (
            <View key={idx} style={[s.fieldRow, { gap: 8 }]}>
              <TextInput
                style={[s.fieldInput, { width: 68, flexGrow: 0, flexShrink: 0 }, evt.time && s.fieldInputFilled]}
                value={evt.time}
                onChangeText={(v) => {
                  const updated = form.serviceEvents.map((e, i) => i === idx ? { ...e, time: v } : e);
                  setForm((f) => ({ ...f, serviceEvents: updated }));
                }}
                placeholder="HH:MM"
                placeholderTextColor={colors.mutedForeground}
              />
              <TextInput
                style={[s.fieldInput, { flex: 1 }, evt.label && s.fieldInputFilled]}
                value={evt.label}
                onChangeText={(v) => {
                  const updated = form.serviceEvents.map((e, i) => i === idx ? { ...e, label: v } : e);
                  setForm((f) => ({ ...f, serviceEvents: updated }));
                }}
                placeholder="e.g. Buffet Open"
                placeholderTextColor={colors.mutedForeground}
              />
              <Pressable onPress={() => setForm((f) => ({ ...f, serviceEvents: f.serviceEvents.filter((_, i) => i !== idx) }))}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
          <Pressable
            style={s.addDietaryBtn}
            onPress={() => setForm((f) => ({ ...f, serviceEvents: [...f.serviceEvents, { time: "", label: "" }] }))}
          >
            <Feather name="plus-circle" size={16} color={colors.info} />
            <Text style={[s.addDietaryText, { color: colors.info }]}>Add milestone</Text>
          </Pressable>
        </View>

        {/* Dietary requirements */}
        <Text style={s.sectionLabel}>Dietary Requirements</Text>
        <View style={s.card}>
          {form.dietaryRequirements.map((req, idx) => {
            const dc = getDietaryColor(req.name);
            return (
              <View key={idx} style={s.dietaryRow}>
                <View style={s.dietaryInputRow}>
                  <View style={[s.dietaryColorDot, { backgroundColor: dc }]} />
                  <TextInput
                    style={[s.dietaryNameInput, { color: dc }]}
                    value={req.name}
                    onChangeText={(v) => {
                      const updated = form.dietaryRequirements.map((d, i) => i === idx ? { ...d, name: v } : d);
                      setForm((f) => ({ ...f, dietaryRequirements: updated }));
                    }}
                    placeholder="Requirement name"
                    placeholderTextColor={colors.mutedForeground}
                  />
                  <TextInput
                    style={[s.dietaryCountInput, { color: dc }]}
                    value={req.count}
                    onChangeText={(v) => {
                      const updated = form.dietaryRequirements.map((d, i) => i === idx ? { ...d, count: v } : d);
                      setForm((f) => ({ ...f, dietaryRequirements: updated }));
                    }}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.mutedForeground}
                  />
                  <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>guests</Text>
                  <Pressable onPress={() => {
                    setForm((f) => ({ ...f, dietaryRequirements: f.dietaryRequirements.filter((_, i) => i !== idx) }));
                  }}>
                    <Feather name="x" size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>
                <TextInput
                  style={s.dietaryNoteInput}
                  value={req.note}
                  onChangeText={(v) => {
                    const updated = form.dietaryRequirements.map((d, i) => i === idx ? { ...d, note: v } : d);
                    setForm((f) => ({ ...f, dietaryRequirements: updated }));
                  }}
                  placeholder="Special note (optional)"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            );
          })}
          <Pressable
            style={s.addDietaryBtn}
            onPress={() => {
              setForm((f) => ({ ...f, dietaryRequirements: [...f.dietaryRequirements, { name: "", count: "1", note: "" }] }));
            }}
          >
            <Feather name="plus-circle" size={16} color={colors.primary} />
            <Text style={s.addDietaryText}>Add dietary requirement</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Toolbar */}
      <View style={s.toolbar}>
        <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={s.toolbarTitle}>Add New Event</Text>
        <Pressable style={({ pressed }) => [s.saveBtn, pressed && { opacity: 0.8 }]} onPress={handleSave}>
          <Feather name="check" size={15} color="#fff" />
          <Text style={s.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        <Pressable
          style={[s.tabBtn, tab === "import" && { backgroundColor: colors.primary }]}
          onPress={() => setTab("import")}
        >
          <Ionicons name="scan-outline" size={16} color={tab === "import" ? "#fff" : colors.mutedForeground} />
          <Text style={[s.tabBtnText, { color: tab === "import" ? "#fff" : colors.mutedForeground }]}>Smart Import</Text>
        </Pressable>
        <Pressable
          style={[s.tabBtn, tab === "manual" && { backgroundColor: colors.primary }]}
          onPress={() => setTab("manual")}
        >
          <Feather name="edit-3" size={16} color={tab === "manual" ? "#fff" : colors.mutedForeground} />
          <Text style={[s.tabBtnText, { color: tab === "manual" ? "#fff" : colors.mutedForeground }]}>Manual Entry</Text>
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── SMART IMPORT TAB ───────────────────────────────────────── */}
        {tab === "import" && (
          <>
            <View style={s.importHero}>
              <Text style={s.importTitle}>Paste your function sheet or email</Text>
              <Text style={s.importSub}>
                Copy text from your booking email, Events system, or type the details — we'll read the key information for you.
              </Text>
            </View>

            <TextInput
              style={s.textArea}
              value={pasteText}
              onChangeText={setPasteText}
              placeholder={PLACEHOLDER}
              placeholderTextColor={colors.mutedForeground + "90"}
              multiline
              scrollEnabled={false}
            />

            <Pressable style={({ pressed }) => [s.parseBtn, pressed && { opacity: 0.85 }]} onPress={handleParse}>
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={s.parseBtnText}>Extract Details</Text>
            </Pressable>

            {pasteText.length > 0 && (
              <Pressable style={s.clearBtn} onPress={handleClearImport}>
                <Text style={s.clearBtnText}>Clear and start over</Text>
              </Pressable>
            )}

            {/* Result banner */}
            {parsed && (
              <View style={[s.resultBanner, { backgroundColor: foundCount >= 4 ? "#22C55E15" : "#F59E0B15", borderColor: foundCount >= 4 ? "#22C55E50" : "#F59E0B50" }]}>
                <Ionicons
                  name={foundCount >= 4 ? "checkmark-circle" : "information-circle"}
                  size={22}
                  color={foundCount >= 4 ? "#22C55E" : "#F59E0B"}
                />
                <Text style={[s.resultBannerText, { color: foundCount >= 4 ? "#22C55E" : "#F59E0B" }]}>
                  {foundCount >= 4
                    ? `Found ${foundCount} fields — review below and tap Save`
                    : `Found ${foundCount} field${foundCount !== 1 ? "s" : ""} — fill in the red dots below`}
                </Text>
              </View>
            )}

            {/* Editable form after parse */}
            {parsed && renderFormFields(true)}
          </>
        )}

        {/* ── MANUAL ENTRY TAB ───────────────────────────────────────── */}
        {tab === "manual" && (
          <>
            <View style={[s.importHero, { backgroundColor: colors.info + "15", borderColor: colors.info + "50", marginTop: 16 }]}>
              <Text style={[s.importTitle, { color: colors.info }]}>Enter function details</Text>
              <Text style={s.importSub}>Fill in what you know — you can always edit more details after saving.</Text>
            </View>
            {renderFormFields(false)}
          </>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
