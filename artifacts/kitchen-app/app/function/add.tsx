import { Feather, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import * as XLSX from "xlsx";
import {
  FunctionType,
  KitchenFunction,
  TimelineItem,
  getAccessLevel,
  useKitchen,
} from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";
import { parseDocument, parseAIText, parseAIImage, type ParsedFunctionData } from "@/services/cloudSync";

// ── Constants ──────────────────────────────────────────────────────────────

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
  if (n.includes("gluten"))     return "#22C55E";
  if (n.includes("vegan"))      return "#84CC16";
  if (n.includes("vegetarian")) return "#4ADE80";
  if (n.includes("nut"))        return "#F59E0B";
  if (n.includes("dairy"))      return "#60A5FA";
  if (n.includes("shellfish") || n.includes("seafood")) return "#F97316";
  if (n.includes("halal"))      return "#14B8A6";
  if (n.includes("kosher"))     return "#8B5CF6";
  if (n.includes("egg"))        return "#FCD34D";
  return "#94A3B8";
}

function getPrepTeamColor(team: string): string {
  switch (team) {
    case "Hot Kitchen":   return "#EF4444";
    case "Cold Larder":   return "#60A5FA";
    case "Pastry":        return "#EC4899";
    case "Function Team": return "#EAB308";
    default:              return "#94A3B8";
  }
}

// ── Timeline generator ─────────────────────────────────────────────────────

function timeToMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function fmtMins(mins: number): string {
  const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60);
  const m = ((mins % 60) + 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateTimeline(
  functionType: FunctionType,
  startTime: string,
  endTime: string,
  guestCount: number,
  serviceEvents: Array<{ time: string; label: string }>,
  room: string,
): TimelineItem[] {
  const startMins = timeToMins(startTime);
  const endMins   = timeToMins(endTime);
  const items: TimelineItem[] = [];
  let idx = 1;
  const add = (time: string, task: string, category: TimelineItem["category"]) =>
    items.push({ id: `gen_${idx++}`, time, task, category, completed: false });

  const setupHrs = guestCount > 300 ? 7 : guestCount > 150 ? 5 : guestCount > 50 ? 3 : 2;
  const kitchenOpen = fmtMins(Math.max(5 * 60, startMins - setupHrs * 60));
  add(kitchenOpen, `KITCHEN OPEN — Mise en place. All stations set, benches clear, HACCP sheets started. Cold room temp check.`, "setup");
  if (guestCount > 40) {
    add(fmtMins(timeToMins(kitchenOpen) + 90), `Protein portioning and prep. Dietary alternates labelled and separated on dedicated trays.`, "setup");
  }
  if (guestCount > 100) {
    add(fmtMins(timeToMins(kitchenOpen) + 180), `Sauce reductions on. Pastry items into oven. Cross-contamination check all allergen stations.`, "setup");
  }
  if (functionType === "Buffet") {
    add(fmtMins(startMins - 60), `Chafing dishes set, water pans filled. Dietary labels placed. Carving station board and knife set.`, "venue");
  }
  add(fmtMins(startMins - 40), `VENUE CHECK — ${room}: crockery polished, mise en place on pass, lamps on. Table numbers confirmed.`, "venue");
  add(fmtMins(startMins - 15), `PRE-SERVICE BRIEF — All team. Runner sections confirmed. Allergen plan reviewed. Manager sign-off.`, "brief");

  const sorted = [...serviceEvents].sort((a, b) => a.time.localeCompare(b.time));
  if (sorted.length > 0) {
    for (const evt of sorted) {
      const isBuffet = evt.label.toLowerCase().includes("open") || evt.label.toLowerCase().includes("close");
      const suffix = isBuffet
        ? `${evt.label.toUpperCase()} — replenishment plan every 20 min.`
        : `${evt.label.toUpperCase()} — ${guestCount} covers. Allergen alternates on separate labelled tray.`;
      add(evt.time, suffix, "service");
    }
  } else {
    add(startTime, `SERVICE START — Guests arrive. All stations ready. ${guestCount} covers.`, "service");
    const midMins = Math.round((startMins + endMins) / 2);
    add(fmtMins(midMins), `Mid-service check — replenish stations, clear empties. Allergen alternates confirmed.`, "service");
  }
  add(fmtMins(endMins - 30), `Last covers cleared. Pass broken down. Leftover food labelled & chilled for HACCP.`, "close");
  add(fmtMins(endMins), `KITCHEN CLEAR — All surfaces sanitised. HACCP sheets completed & signed by manager. Waste logged.`, "close");
  return items.sort((a, b) => a.time.localeCompare(b.time));
}

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "import" | "manual";
type ImportMode = "paste" | "file" | "scan" | "gallery";

interface FormState {
  name: string;
  room: string;
  floor: string;
  date: string;
  functionType: FunctionType;
  startTime: string;
  endTime: string;
  guestCount: string;
  serviceEvents: Array<{ time: string; label: string }>;
  dietaryRequirements: Array<{ name: string; count: string; note: string }>;
  menu: string[];
  prepItems: Array<{ team: string; dish: string; quantity: string; deadline: string }>;
  specialRequirements: string[];
}

interface ParseBanner {
  fieldsFound: number;
  menuCount: number;
  prepCount: number;
  aiUsed: boolean;
  allergenCount: number;
  haccpCount: number;
  termCount: number;
}

const EMPTY_FORM: FormState = {
  name: "", room: "", floor: "", date: "", functionType: "A-la-carte",
  startTime: "", endTime: "", guestCount: "",
  serviceEvents: [], dietaryRequirements: [],
  menu: [], prepItems: [], specialRequirements: [],
};

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

// ── Component ──────────────────────────────────────────────────────────────

export default function AddFunctionScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const { addFunction, currentStaffId, staff } = useKitchen();
  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const isManager = currentMember ? getAccessLevel(currentMember) === "manager" : false;
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const scrollRef = useRef<ScrollView>(null);

  const [tab, setTab]               = useState<Tab>("import");
  const [importMode, setImportMode] = useState<ImportMode>("paste");
  const [pasteText, setPasteText]   = useState("");
  const [banner, setBanner]         = useState<ParseBanner | null>(null);
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError]     = useState<string | null>(null);
  const [selectedFile, setSelectedFile]   = useState<{ name: string; uri: string; mimeType: string } | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showMenu, setShowMenu]           = useState(false);
  const [showPrep, setShowPrep]           = useState(false);
  const [showAllergens, setShowAllergens] = useState(true);
  const [showHaccp, setShowHaccp]         = useState(false);
  const [showGlossary, setShowGlossary]   = useState(false);
  const [parsedAllergens, setParsedAllergens] = useState<ParsedFunctionData["allergenWarnings"]>([]);
  const [parsedHaccp, setParsedHaccp]         = useState<ParsedFunctionData["haccpNotes"]>([]);
  const [parsedTerms, setParsedTerms]         = useState<ParsedFunctionData["detectedTerminology"]>([]);

  if (!isManager) {
    const ns = StyleSheet.create({
      root:    { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 32 },
      title:   { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 20, textAlign: "center" },
      sub:     { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 10, textAlign: "center", lineHeight: 22 },
      btn:     { marginTop: 24, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
      btnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    });
    return (
      <View style={ns.root}>
        <Ionicons name="lock-closed" size={48} color={colors.mutedForeground} />
        <Text style={ns.title}>Manager access only</Text>
        <Text style={ns.sub}>Only managers can add events. Sign in as a manager on the Roster tab to continue.</Text>
        <Pressable style={ns.btn} onPress={() => router.back()}><Text style={ns.btnText}>Go back</Text></Pressable>
      </View>
    );
  }

  // ── Apply parsed data from API ─────────────────────────────────────────

  function applyParsedData(data: ParsedFunctionData) {
    const ft: FunctionType = (FUNCTION_TYPES as string[]).includes(data.functionType)
      ? (data.functionType as FunctionType)
      : "A-la-carte";

    setForm((prev) => ({
      name:         data.name        || prev.name,
      room:         data.room        || prev.room,
      floor:        data.floor       || prev.floor,
      date:         data.date        || prev.date,
      functionType: ft,
      startTime:    data.startTime   || prev.startTime,
      endTime:      data.endTime     || prev.endTime,
      guestCount:   data.guestCount > 0 ? String(data.guestCount) : prev.guestCount,
      serviceEvents: data.serviceEvents.length > 0
        ? data.serviceEvents
        : (prev.serviceEvents.length === 0 ? TYPE_MILESTONE_TEMPLATES[ft] : prev.serviceEvents),
      dietaryRequirements: data.dietaryRequirements.length > 0
        ? data.dietaryRequirements.map((d) => ({ name: d.name, count: String(d.count), note: d.note }))
        : prev.dietaryRequirements,
      menu:                data.menu.length > 0 ? data.menu : prev.menu,
      prepItems:           data.prepItems.length > 0 ? data.prepItems : prev.prepItems,
      specialRequirements: data.specialRequirements.length > 0 ? data.specialRequirements : prev.specialRequirements,
    }));

    // Store enhanced culinary intelligence fields
    setParsedAllergens(data.allergenWarnings ?? []);
    setParsedHaccp(data.haccpNotes ?? []);
    setParsedTerms(data.detectedTerminology ?? []);
    // Auto-expand allergen card if critical warnings found
    setShowAllergens((data.allergenWarnings?.length ?? 0) > 0);

    const allergenCount = data.allergenWarnings?.length ?? 0;
    const haccpCount = data.haccpNotes?.filter((n) => n.priority === "critical").length ?? 0;
    const termCount = data.detectedTerminology?.length ?? 0;
    const fieldsFound = [data.name, data.room, data.startTime, data.guestCount > 0, data.functionType].filter(Boolean).length;
    setBanner({ fieldsFound, menuCount: data.menu.length, prepCount: data.prepItems.length, aiUsed: data.aiUsed, allergenCount, haccpCount, termCount });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 420, animated: true }), 200);
  }

  // ── Import mode handlers ───────────────────────────────────────────────

  async function handlePasteExtract() {
    if (!pasteText.trim()) {
      Alert.alert("Nothing to read", "Please paste some text first.");
      return;
    }
    setImportLoading(true);
    setImportError(null);
    try {
      const result = await parseAIText(pasteText.trim());
      applyParsedData(result);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not connect to server");
    } finally {
      setImportLoading(false);
    }
  }

  async function handleFilePick() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/plain",
          "text/csv",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets?.[0];
      if (!file) return;
      setSelectedFile({ name: file.name, uri: file.uri, mimeType: file.mimeType ?? "" });
      setBanner(null);
      setImportError(null);
    } catch {
      setImportError("Could not open file picker");
    }
  }

  async function handleProcessFile() {
    if (!selectedFile) return;
    setImportLoading(true);
    setImportError(null);

    try {
      const ext = selectedFile.name.toLowerCase().split(".").pop() ?? "";

      // Excel: parse client-side, convert to CSV text, then call AI parse
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        const b64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: "base64" as const,
        });
        const wb = XLSX.read(b64, { type: "base64" });
        const texts: string[] = [];
        for (const name of wb.SheetNames) {
          const ws = wb.Sheets[name];
          if (ws) texts.push(XLSX.utils.sheet_to_csv(ws));
        }
        const csvText = texts.join("\n\n");
        const result = await parseAIText(csvText);
        applyParsedData(result);
      } else {
        // Word / PDF / text — upload to server for extraction
        const b64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: "base64" as const,
        });
        const result = await parseDocument(b64, selectedFile.name, selectedFile.mimeType);
        applyParsedData(result);
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not process file");
    } finally {
      setImportLoading(false);
    }
  }

  async function handleCameraScan() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Camera access needed", "Allow camera access in Settings to scan documents.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.92,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0]!;
    setCapturedImage(asset.uri);
    setBanner(null);
    setImportError(null);
    setImportLoading(true);
    try {
      const b64 = asset.base64
        ?? await FileSystem.readAsStringAsync(asset.uri, { encoding: "base64" as const });
      const parsed = await parseAIImage(b64, asset.mimeType ?? "image/jpeg");
      applyParsedData(parsed);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not process image");
    } finally {
      setImportLoading(false);
    }
  }

  async function handleGalleryPick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Photo access needed", "Allow photo library access in Settings.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.92,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0]!;
    setCapturedImage(asset.uri);
    setBanner(null);
    setImportError(null);
    setImportLoading(true);
    try {
      const b64 = asset.base64
        ?? await FileSystem.readAsStringAsync(asset.uri, { encoding: "base64" as const });
      const parsed = await parseAIImage(b64, asset.mimeType ?? "image/jpeg");
      applyParsedData(parsed);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not process image");
    } finally {
      setImportLoading(false);
    }
  }

  function handleClearImport() {
    setPasteText("");
    setBanner(null);
    setForm(EMPTY_FORM);
    setImportError(null);
    setSelectedFile(null);
    setCapturedImage(null);
    setShowMenu(false);
    setShowPrep(false);
    setShowAllergens(true);
    setShowHaccp(false);
    setShowGlossary(false);
    setParsedAllergens([]);
    setParsedHaccp([]);
    setParsedTerms([]);
  }

  function handleFunctionTypeChange(type: FunctionType) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setForm((f) => ({
      ...f,
      functionType: type,
      serviceEvents: f.serviceEvents.length === 0 ? TYPE_MILESTONE_TEMPLATES[type] : f.serviceEvents,
    }));
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  function handleSave() {
    const guestNum = parseInt(form.guestCount, 10);
    if (!form.name.trim()) { Alert.alert("Missing name", "Please enter a function name."); return; }
    if (!form.room.trim()) { Alert.alert("Missing room", "Please enter the room or venue."); return; }
    if (!form.startTime)   { Alert.alert("Missing start time", "Please enter a start time (e.g. 18:30)."); return; }
    if (isNaN(guestNum) || guestNum < 1) { Alert.alert("Invalid guest count", "Please enter a valid number of guests."); return; }

    const id = `fn_${Date.now()}`;
    const newFn: KitchenFunction = {
      id,
      name:         form.name.trim(),
      room:         form.room.trim(),
      floor:        form.floor.trim() || "Ground Floor",
      functionType: form.functionType,
      date:         form.date || undefined,
      startTime:    form.startTime,
      endTime:      form.endTime || form.startTime,
      guestCount:   guestNum,
      status:       "upcoming",
      menu:         form.menu,
      dietaryRequirements: form.dietaryRequirements
        .filter((d) => d.name.trim() && parseInt(d.count, 10) > 0)
        .map((d) => ({ name: d.name.trim(), count: parseInt(d.count, 10), note: d.note })),
      serviceEvents: form.serviceEvents
        .filter((e) => e.time.trim() && e.label.trim())
        .sort((a, b) => a.time.localeCompare(b.time)),
      teamIds: [],
      timeline: generateTimeline(
        form.functionType,
        form.startTime,
        form.endTime || form.startTime,
        guestNum,
        form.serviceEvents.filter((e) => e.time.trim() && e.label.trim()),
        form.room.trim() || "venue",
      ),
    };

    addFunction(newFn);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Event added",
      `${form.name} has been saved with a full run sheet (${newFn.timeline.length} tasks)${form.menu.length > 0 ? `, ${form.menu.length} menu items` : ""}${form.prepItems.length > 0 ? `, and ${form.prepItems.length} prep tasks auto-generated` : ""}.`,
      [{ text: "Done", onPress: () => router.back() }],
    );
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const s = StyleSheet.create({
    root:         { flex: 1, backgroundColor: colors.background },
    toolbar:      { paddingTop: topPad + 10, paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
    toolbarTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    saveBtn:      { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.accent },
    saveBtnText:  { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

    tabBar:       { flexDirection: "row", marginHorizontal: 20, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: "hidden", backgroundColor: colors.card },
    tabBtn:       { flex: 1, paddingVertical: 11, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
    tabBtnText:   { fontSize: 13, fontFamily: "Inter_700Bold" },

    modeBar:      { flexDirection: "row", marginHorizontal: 20, marginTop: 14, gap: 8 },
    modeBtn:      { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: "center", gap: 4 },
    modeBtnLabel: { fontSize: 11, fontFamily: "Inter_700Bold" },

    // Import hero/card
    importHero:   { marginHorizontal: 20, marginTop: 14, padding: 16, borderRadius: colors.radius, backgroundColor: colors.primary + "15", borderWidth: 1.5, borderColor: colors.primary + "50" },
    importTitle:  { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.primary, marginBottom: 3 },
    importSub:    { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 20 },

    fileCard:     { marginHorizontal: 20, marginTop: 14, padding: 20, borderRadius: colors.radius, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center", gap: 10 },
    fileCardText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textAlign: "center" },
    fileCardSub:  { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" },
    fileName:     { marginHorizontal: 20, marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: colors.primary + "18", borderWidth: 1, borderColor: colors.primary + "40", flexDirection: "row", alignItems: "center", gap: 10 },
    fileNameText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary },

    imagePreview: { marginHorizontal: 20, marginTop: 12, borderRadius: 12, overflow: "hidden", height: 180 },

    textArea:     { marginHorizontal: 20, marginTop: 12, borderRadius: colors.radius, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, padding: 14, minHeight: 180, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22, textAlignVertical: "top" },

    actionBtn:    { marginHorizontal: 20, marginTop: 12, borderRadius: colors.radius, paddingVertical: 15, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    actionBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    secondaryBtn: { marginHorizontal: 20, marginTop: 8, borderRadius: colors.radius, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
    secondaryBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },

    loadingRow:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 20, marginTop: 14, padding: 16, borderRadius: colors.radius, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    loadingText:  { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },

    errorCard:    { marginHorizontal: 20, marginTop: 12, padding: 14, borderRadius: colors.radius, backgroundColor: "#EF444415", borderWidth: 1, borderColor: "#EF444450", flexDirection: "row", alignItems: "flex-start", gap: 10 },
    errorText:    { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#EF4444", lineHeight: 19 },

    resultBanner: { marginHorizontal: 20, marginTop: 16, padding: 14, borderRadius: colors.radius, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1 },
    resultBannerText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },

    sectionLabel: { marginHorizontal: 20, marginTop: 22, marginBottom: 8, fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1 },
    card:         { marginHorizontal: 20, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: "hidden" },
    fieldRow:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 54 },
    fieldLabel:   { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, width: 90 },
    fieldInput:   { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 12 },
    fieldInputFilled: { color: colors.primary },
    missingDot:   { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#EF4444", marginLeft: 6 },

    typeWrap:     { padding: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 },
    typeChip:     { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, borderWidth: 1.5, flexDirection: "row", alignItems: "center", gap: 5 },
    typeChipText: { fontSize: 13, fontFamily: "Inter_700Bold" },

    dietaryRow:   { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 },
    dietaryInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dietaryColorDot: { width: 10, height: 10, borderRadius: 5 },
    dietaryNameInput: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 4 },
    dietaryCountInput: { width: 52, fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
    dietaryNoteInput: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, paddingTop: 2 },
    addDietaryBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
    addDietaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primary },

    expandRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
    expandLabel:  { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground },
    expandCount:  { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary, backgroundColor: colors.primary + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    menuItem:     { paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: "row", alignItems: "flex-start", gap: 8 },
    menuDot:      { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.primary, marginTop: 7 },
    menuItemText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 20 },
    menuCourse:   { fontSize: 11, fontFamily: "Inter_700Bold", color: colors.primary, textTransform: "uppercase", letterSpacing: 0.5 },

    prepItem:     { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
    prepTeamTag:  { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, alignSelf: "flex-start", marginBottom: 3 },
    prepTeamText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
    prepDish:     { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    prepMeta:     { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },

    // Allergen card styles
    allergenItem:     { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
    severityBadge:    { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
    severityText:     { fontSize: 10, fontFamily: "Inter_700Bold" },
    allergenDish:     { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
    allergenTag:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
    allergenTagText:  { fontSize: 11, fontFamily: "Inter_700Bold" },
    allergenNote:     { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 17, fontStyle: "italic" },
    allergenFooter:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
    allergenFooterText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 16, fontStyle: "italic" },

    // HACCP card styles
    haccpGroupHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
    haccpGroupDot:    { width: 8, height: 8, borderRadius: 4 },
    haccpGroupLabel:  { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
    haccpItem:        { paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, gap: 3 },
    haccpTempBadge:   { flexDirection: "row", alignItems: "center", gap: 3, alignSelf: "flex-start", backgroundColor: "#F9741620", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
    haccpTempText:    { fontSize: 11, fontFamily: "Inter_700Bold", color: "#F97316" },
    haccpRule:        { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 19 },
    haccpContext:     { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, fontStyle: "italic" },

    // Terminology glossary styles
    glossaryItem:     { paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, gap: 2 },
    langBadge:        { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
    langBadgeText:    { fontSize: 10, fontFamily: "Inter_700Bold" },
    glossaryTerm:     { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    glossaryMeaning:  { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 18, paddingLeft: 4 },

    bottomPad:    { height: Platform.OS === "web" ? 80 : insets.bottom + 100 },
  });

  // ── Render helpers ────────────────────────────────────────────────────────

  const hasParsed = banner !== null;

  function renderModeBar() {
    const modes: Array<{ id: ImportMode; icon: string; label: string }> = [
      { id: "paste",   icon: "clipboard-outline", label: "Paste" },
      { id: "file",    icon: "document-outline",  label: "File" },
      { id: "scan",    icon: "scan-outline",       label: "Scan" },
      { id: "gallery", icon: "image-outline",      label: "Photo" },
    ];
    return (
      <View style={s.modeBar}>
        {modes.map(({ id, icon, label }) => {
          const active = importMode === id;
          return (
            <Pressable
              key={id}
              style={[s.modeBtn, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary + "18" : "transparent" }]}
              onPress={() => { setImportMode(id); setImportError(null); }}
            >
              <Ionicons name={icon as any} size={18} color={active ? colors.primary : colors.mutedForeground} />
              <Text style={[s.modeBtnLabel, { color: active ? colors.primary : colors.mutedForeground }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderPasteMode() {
    return (
      <>
        <View style={s.importHero}>
          <Text style={s.importTitle}>Paste your function sheet or email</Text>
          <Text style={s.importSub}>Paste text from your booking system, email, or any document — the AI reads it and fills everything in automatically.</Text>
        </View>
        <TextInput
          style={s.textArea}
          value={pasteText}
          onChangeText={setPasteText}
          placeholder={"Paste any function sheet, email, or BEO here...\n\nExample:\n  Smith Wedding — Ballroom A, Level 1\n  Saturday 10 May 2026  ·  6:30pm to 11:00pm\n  180 guests  |  Set Menu\n  Entrée 7:00pm  ·  Main 8:30pm  ·  Dessert 9:30pm\n  Dietary: 8 GF, 3 vegan, 2 nut allergy"}
          placeholderTextColor={colors.mutedForeground + "80"}
          multiline
          scrollEnabled={false}
        />
        <Pressable style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.85 }]} onPress={handlePasteExtract}>
          <Ionicons name="flash" size={18} color="#fff" />
          <Text style={s.actionBtnText}>Extract Details</Text>
        </Pressable>
        {pasteText.length > 0 && (
          <Pressable style={s.secondaryBtn} onPress={handleClearImport}>
            <Text style={s.secondaryBtnText}>Clear and start over</Text>
          </Pressable>
        )}
      </>
    );
  }

  function renderFileMode() {
    return (
      <>
        <View style={s.fileCard}>
          <Ionicons name="document-text-outline" size={40} color={colors.primary} />
          <Text style={s.fileCardText}>Import Excel, Word, or PDF</Text>
          <Text style={s.fileCardSub}>
            Supports .xlsx, .xls, .csv, .docx, .pdf, .txt{"\n"}
            Works with Delphi, Opera, iVvy, Priava, and any BEO export
          </Text>
          <Pressable
            style={[s.actionBtn, { marginHorizontal: 0, marginTop: 4, paddingHorizontal: 28 }]}
            onPress={handleFilePick}
          >
            <Feather name="upload" size={16} color="#fff" />
            <Text style={s.actionBtnText}>Pick File</Text>
          </Pressable>
        </View>

        {selectedFile && (
          <View style={s.fileName}>
            <Feather name="file" size={16} color={colors.primary} />
            <Text style={s.fileNameText} numberOfLines={1}>{selectedFile.name}</Text>
            <Pressable onPress={() => setSelectedFile(null)}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        {selectedFile && (
          <Pressable style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.85 }]} onPress={handleProcessFile}>
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={s.actionBtnText}>Read & Fill Form</Text>
          </Pressable>
        )}
      </>
    );
  }

  function renderScanMode() {
    return (
      <>
        <View style={s.fileCard}>
          <Ionicons name="scan" size={40} color={colors.primary} />
          <Text style={s.fileCardText}>Scan a document with your camera</Text>
          <Text style={s.fileCardSub}>
            Point your camera at a printed function sheet,{"\n"}
            BEO, or event brief — the AI reads it for you
          </Text>
          <Pressable
            style={[s.actionBtn, { marginHorizontal: 0, marginTop: 4, paddingHorizontal: 28 }]}
            onPress={handleCameraScan}
          >
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={s.actionBtnText}>Open Camera</Text>
          </Pressable>
        </View>
        {capturedImage && (
          <View style={s.imagePreview}>
            <Image source={{ uri: capturedImage }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          </View>
        )}
        {capturedImage && !importLoading && !hasParsed && (
          <Pressable style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.85 }]} onPress={handleCameraScan}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={s.actionBtnText}>Rescan</Text>
          </Pressable>
        )}
      </>
    );
  }

  function renderGalleryMode() {
    return (
      <>
        <View style={s.fileCard}>
          <Ionicons name="images-outline" size={40} color={colors.primary} />
          <Text style={s.fileCardText}>Import a photo of your function sheet</Text>
          <Text style={s.fileCardSub}>
            Choose a photo from your gallery — works with{"\n"}
            screenshots, photos of printed documents, or saved PDFs
          </Text>
          <Pressable
            style={[s.actionBtn, { marginHorizontal: 0, marginTop: 4, paddingHorizontal: 28 }]}
            onPress={handleGalleryPick}
          >
            <Ionicons name="images-outline" size={18} color="#fff" />
            <Text style={s.actionBtnText}>Choose Photo</Text>
          </Pressable>
        </View>
        {capturedImage && (
          <View style={s.imagePreview}>
            <Image source={{ uri: capturedImage }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          </View>
        )}
        {capturedImage && !importLoading && !hasParsed && (
          <Pressable style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.85 }]} onPress={handleGalleryPick}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={s.actionBtnText}>Choose different photo</Text>
          </Pressable>
        )}
      </>
    );
  }

  function getAllergenColor(severity: "definite" | "likely" | "possible"): string {
    if (severity === "definite") return "#EF4444";
    if (severity === "likely")   return "#F97316";
    return "#F59E0B";
  }

  function getHACCPColor(priority: "critical" | "major" | "minor"): string {
    if (priority === "critical") return "#EF4444";
    if (priority === "major")    return "#F97316";
    return "#6B7A94";
  }

  function getLanguageColor(lang: string): string {
    if (lang === "French")         return "#8B5CF6";
    if (lang === "Te Reo Māori")   return "#22C55E";
    if (lang === "AU/NZ")          return "#3B82F6";
    return "#6B7A94";
  }

  function renderAllergenWarnings() {
    if (!parsedAllergens || parsedAllergens.length === 0) return null;
    const criticalCount = parsedAllergens.filter((w) => w.severity === "definite").length;
    return (
      <>
        <Text style={s.sectionLabel}>Allergen Intelligence</Text>
        <View style={[s.card, { borderColor: "#EF444440" }]}>
          <Pressable style={s.expandRow} onPress={() => setShowAllergens((v) => !v)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="warning" size={16} color="#EF4444" />
              <Text style={s.expandLabel}>Allergen Risks Found</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {criticalCount > 0 && (
                <View style={{ backgroundColor: "#EF444425", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "#EF4444" }}>{criticalCount} DEFINITE</Text>
                </View>
              )}
              <Text style={s.expandCount}>{parsedAllergens.length} dishes</Text>
              <Feather name={showAllergens ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
          {showAllergens && parsedAllergens.map((warning, idx) => {
            const col = getAllergenColor(warning.severity);
            const [, ...dishRest] = warning.dish.split(": ");
            const dishName = dishRest.join(": ") || warning.dish;
            return (
              <View key={idx} style={[s.allergenItem, { borderTopColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <View style={[s.severityBadge, { backgroundColor: col + "20", borderColor: col + "50" }]}>
                    <Text style={[s.severityText, { color: col }]}>{warning.severity.toUpperCase()}</Text>
                  </View>
                  <Text style={[s.allergenDish, { color: colors.foreground }]} numberOfLines={1}>{dishName}</Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                  {warning.allergens.map((a) => (
                    <View key={a} style={[s.allergenTag, { backgroundColor: col + "18", borderColor: col + "40" }]}>
                      <Text style={[s.allergenTagText, { color: col }]}>{a}</Text>
                    </View>
                  ))}
                </View>
                {warning.note ? (
                  <Text style={s.allergenNote}>{warning.note}</Text>
                ) : null}
              </View>
            );
          })}
          {showAllergens && (
            <View style={s.allergenFooter}>
              <Ionicons name="information-circle-outline" size={14} color={colors.mutedForeground} />
              <Text style={s.allergenFooterText}>Auto-inferred from dish names — always verify with client.</Text>
            </View>
          )}
        </View>
      </>
    );
  }

  function renderHACCPNotes() {
    if (!parsedHaccp || parsedHaccp.length === 0) return null;
    const criticals = parsedHaccp.filter((n) => n.priority === "critical");
    const majors    = parsedHaccp.filter((n) => n.priority === "major");
    const minors    = parsedHaccp.filter((n) => n.priority === "minor");
    return (
      <>
        <Text style={s.sectionLabel}>HACCP Critical Points</Text>
        <View style={[s.card, { borderColor: "#F9741640" }]}>
          <Pressable style={s.expandRow} onPress={() => setShowHaccp((v) => !v)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="thermometer" size={16} color="#F97316" />
              <Text style={s.expandLabel}>Food Safety Controls</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {criticals.length > 0 && (
                <View style={{ backgroundColor: "#EF444425", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "#EF4444" }}>{criticals.length} CRITICAL</Text>
                </View>
              )}
              <Text style={s.expandCount}>{parsedHaccp.length} rules</Text>
              <Feather name={showHaccp ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
          {showHaccp && ([
            { items: criticals, label: "CRITICAL", color: "#EF4444" },
            { items: majors,    label: "MAJOR",    color: "#F97316" },
            { items: minors,    label: "MINOR",    color: "#6B7A94" },
          ] as const).map(({ items, label, color }) =>
            items.length > 0 ? (
              <View key={label}>
                <View style={[s.haccpGroupHeader, { backgroundColor: color + "15" }]}>
                  <View style={[s.haccpGroupDot, { backgroundColor: color }]} />
                  <Text style={[s.haccpGroupLabel, { color }]}>{label}</Text>
                </View>
                {items.map((note, idx) => (
                  <View key={idx} style={[s.haccpItem, { borderTopColor: colors.border }]}>
                    {note.minTemp != null && (
                      <View style={s.haccpTempBadge}>
                        <Ionicons name="thermometer" size={12} color="#F97316" />
                        <Text style={s.haccpTempText}>{note.minTemp}°C min</Text>
                      </View>
                    )}
                    <Text style={s.haccpRule}>{note.rule}</Text>
                    {note.context && note.context !== "all functions" && (
                      <Text style={s.haccpContext}>Context: {note.context}</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : null
          )}
          {showHaccp && (
            <View style={s.allergenFooter}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.mutedForeground} />
              <Text style={s.allergenFooterText}>FSANZ / MPI aligned. Complete HACCP log before service.</Text>
            </View>
          )}
        </View>
      </>
    );
  }

  function renderTerminologyGlossary() {
    if (!parsedTerms || parsedTerms.length === 0) return null;
    return (
      <>
        <Text style={s.sectionLabel}>Culinary Terminology Detected</Text>
        <View style={s.card}>
          <Pressable style={s.expandRow} onPress={() => setShowGlossary((v) => !v)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="language" size={16} color={colors.primary} />
              <Text style={s.expandLabel}>Glossary</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.expandCount}>{parsedTerms.length} terms</Text>
              <Feather name={showGlossary ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
          {showGlossary && parsedTerms.map((t, idx) => {
            const langColor = getLanguageColor(t.language);
            return (
              <View key={idx} style={[s.glossaryItem, { borderTopColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                  <View style={[s.langBadge, { backgroundColor: langColor + "20" }]}>
                    <Text style={[s.langBadgeText, { color: langColor }]}>{t.language}</Text>
                  </View>
                  <Text style={s.glossaryTerm}>{t.term}</Text>
                </View>
                <Text style={s.glossaryMeaning} numberOfLines={2}>{t.meaning}</Text>
              </View>
            );
          })}
        </View>
      </>
    );
  }

  function renderMenu() {
    if (form.menu.length === 0) return null;
    return (
      <>
        <Text style={s.sectionLabel}>Extracted Menu</Text>
        <View style={s.card}>
          <Pressable style={s.expandRow} onPress={() => setShowMenu((v) => !v)}>
            <Text style={s.expandLabel}>Menu Items</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.expandCount}>{form.menu.length} items</Text>
              <Feather name={showMenu ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
          {showMenu && form.menu.map((item, idx) => {
            const [course, ...rest] = item.split(": ");
            const dish = (rest.join(": ") || course) ?? "";
            const hasCourse = rest.length > 0;
            return (
              <View key={idx} style={s.menuItem}>
                <View style={s.menuDot} />
                <View style={{ flex: 1 }}>
                  {hasCourse && <Text style={s.menuCourse}>{course}</Text>}
                  <Text style={s.menuItemText}>{dish}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </>
    );
  }

  function renderPrepList() {
    if (form.prepItems.length === 0) return null;
    return (
      <>
        <Text style={s.sectionLabel}>Auto-Generated Prep List</Text>
        <View style={s.card}>
          <Pressable style={s.expandRow} onPress={() => setShowPrep((v) => !v)}>
            <Text style={s.expandLabel}>Prep Tasks</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.expandCount}>{form.prepItems.length} tasks</Text>
              <Feather name={showPrep ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
          {showPrep && form.prepItems.map((item, idx) => {
            const tc = getPrepTeamColor(item.team);
            return (
              <View key={idx} style={s.prepItem}>
                <View style={[s.prepTeamTag, { backgroundColor: tc }]}>
                  <Text style={s.prepTeamText}>{item.team.toUpperCase()}</Text>
                </View>
                <Text style={s.prepDish}>{item.dish}</Text>
                <Text style={s.prepMeta}>{item.quantity} · Ready by {item.deadline}</Text>
              </View>
            );
          })}
        </View>
      </>
    );
  }

  function renderFormFields(showMissingDots: boolean) {
    return (
      <>
        <Text style={s.sectionLabel}>Basic Details</Text>
        <View style={s.card}>
          {([
            { key: "name",       label: "Event name",   placeholder: "e.g. Smith Wedding Reception", keyboard: "default" as const },
            { key: "room",       label: "Room / Venue",  placeholder: "e.g. Ballroom A",              keyboard: "default" as const },
            { key: "floor",      label: "Floor / Level", placeholder: "e.g. Level 1, Ground Floor",   keyboard: "default" as const },
            { key: "date",       label: "Date",          placeholder: "YYYY-MM-DD",                   keyboard: "default" as const },
            { key: "guestCount", label: "Guests",        placeholder: "e.g. 280",                     keyboard: "number-pad" as const },
          ] as const).map(({ key, label, placeholder, keyboard }, idx, arr) => {
            const val = form[key as keyof FormState] as string;
            const isMissing = showMissingDots && !val && (key === "name" || key === "room" || key === "guestCount");
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

        <Text style={s.sectionLabel}>Service Times</Text>
        <View style={s.card}>
          {([
            { key: "startTime", label: "Start time",  placeholder: "18:30" },
            { key: "endTime",   label: "Finish time", placeholder: "23:00" },
          ] as const).map(({ key, label, placeholder }, idx, arr) => {
            const val = form[key as keyof FormState] as string;
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
                {showMissingDots && key === "startTime" && !val && <View style={s.missingDot} />}
              </View>
            );
          })}
        </View>

        <Text style={s.sectionLabel}>Function Type</Text>
        <View style={s.card}>
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

        <Text style={s.sectionLabel}>Service Milestones <Text style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(optional)</Text></Text>
        <View style={s.card}>
          {form.serviceEvents.map((evt, idx) => (
            <View key={idx} style={[s.fieldRow, { gap: 8 }]}>
              <TextInput
                style={[s.fieldInput, { width: 68, flexGrow: 0, flexShrink: 0 }, evt.time && s.fieldInputFilled]}
                value={evt.time}
                onChangeText={(v) => setForm((f) => ({ ...f, serviceEvents: f.serviceEvents.map((e, i) => i === idx ? { ...e, time: v } : e) }))}
                placeholder="HH:MM"
                placeholderTextColor={colors.mutedForeground}
              />
              <TextInput
                style={[s.fieldInput, { flex: 1 }, evt.label && s.fieldInputFilled]}
                value={evt.label}
                onChangeText={(v) => setForm((f) => ({ ...f, serviceEvents: f.serviceEvents.map((e, i) => i === idx ? { ...e, label: v } : e) }))}
                placeholder="e.g. Buffet Open"
                placeholderTextColor={colors.mutedForeground}
              />
              <Pressable onPress={() => setForm((f) => ({ ...f, serviceEvents: f.serviceEvents.filter((_, i) => i !== idx) }))}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
          <Pressable style={s.addDietaryBtn} onPress={() => setForm((f) => ({ ...f, serviceEvents: [...f.serviceEvents, { time: "", label: "" }] }))}>
            <Feather name="plus-circle" size={16} color={colors.info} />
            <Text style={[s.addDietaryText, { color: colors.info }]}>Add milestone</Text>
          </Pressable>
        </View>

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
                    onChangeText={(v) => setForm((f) => ({ ...f, dietaryRequirements: f.dietaryRequirements.map((d, i) => i === idx ? { ...d, name: v } : d) }))}
                    placeholder="Requirement name"
                    placeholderTextColor={colors.mutedForeground}
                  />
                  <TextInput
                    style={[s.dietaryCountInput, { color: dc }]}
                    value={req.count}
                    onChangeText={(v) => setForm((f) => ({ ...f, dietaryRequirements: f.dietaryRequirements.map((d, i) => i === idx ? { ...d, count: v } : d) }))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.mutedForeground}
                  />
                  <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>guests</Text>
                  <Pressable onPress={() => setForm((f) => ({ ...f, dietaryRequirements: f.dietaryRequirements.filter((_, i) => i !== idx) }))}>
                    <Feather name="x" size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>
                <TextInput
                  style={s.dietaryNoteInput}
                  value={req.note}
                  onChangeText={(v) => setForm((f) => ({ ...f, dietaryRequirements: f.dietaryRequirements.map((d, i) => i === idx ? { ...d, note: v } : d) }))}
                  placeholder="Special note (optional)"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            );
          })}
          <Pressable style={s.addDietaryBtn} onPress={() => setForm((f) => ({ ...f, dietaryRequirements: [...f.dietaryRequirements, { name: "", count: "1", note: "" }] }))}>
            <Feather name="plus-circle" size={16} color={colors.primary} />
            <Text style={s.addDietaryText}>Add dietary requirement</Text>
          </Pressable>
        </View>
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
        <Pressable style={[s.tabBtn, tab === "import" && { backgroundColor: colors.primary }]} onPress={() => setTab("import")}>
          <Ionicons name="flash" size={16} color={tab === "import" ? "#fff" : colors.mutedForeground} />
          <Text style={[s.tabBtnText, { color: tab === "import" ? "#fff" : colors.mutedForeground }]}>Smart Import</Text>
        </Pressable>
        <Pressable style={[s.tabBtn, tab === "manual" && { backgroundColor: colors.primary }]} onPress={() => setTab("manual")}>
          <Feather name="edit-3" size={16} color={tab === "manual" ? "#fff" : colors.mutedForeground} />
          <Text style={[s.tabBtnText, { color: tab === "manual" ? "#fff" : colors.mutedForeground }]}>Manual Entry</Text>
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── SMART IMPORT TAB ─────────────────────────────────────────── */}
        {tab === "import" && (
          <>
            {/* Mode selector */}
            {renderModeBar()}

            {/* Mode-specific content */}
            {importMode === "paste"   && renderPasteMode()}
            {importMode === "file"    && renderFileMode()}
            {importMode === "scan"    && renderScanMode()}
            {importMode === "gallery" && renderGalleryMode()}

            {/* Loading */}
            {importLoading && (
              <View style={s.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={s.loadingText}>
                  {importMode === "file"    ? "Reading document…" :
                   importMode === "scan"    ? "Analysing scan…" :
                   importMode === "gallery" ? "Reading photo…" :
                   "Extracting details…"}
                </Text>
              </View>
            )}

            {/* Error */}
            {importError && !importLoading && (
              <View style={s.errorCard}>
                <Feather name="alert-circle" size={16} color="#EF4444" />
                <Text style={s.errorText}>{importError}</Text>
              </View>
            )}

            {/* Result banner */}
            {hasParsed && !importLoading && banner && (
              <View style={[s.resultBanner, { backgroundColor: banner.fieldsFound >= 4 ? "#22C55E15" : "#F59E0B15", borderColor: banner.fieldsFound >= 4 ? "#22C55E50" : "#F59E0B50" }]}>
                <Ionicons
                  name={banner.fieldsFound >= 4 ? "checkmark-circle" : "information-circle"}
                  size={22}
                  color={banner.fieldsFound >= 4 ? "#22C55E" : "#F59E0B"}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[s.resultBannerText, { color: banner.fieldsFound >= 4 ? "#22C55E" : "#F59E0B" }]}>
                    {banner.fieldsFound >= 4
                      ? `All key details found — review and tap Save`
                      : `${banner.fieldsFound} field${banner.fieldsFound !== 1 ? "s" : ""} found — fill in the missing details below`}
                  </Text>
                  {(banner.menuCount > 0 || banner.prepCount > 0 || banner.allergenCount > 0 || banner.haccpCount > 0) && (
                    <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                      {[
                        banner.menuCount > 0   && `${banner.menuCount} menu items`,
                        banner.prepCount > 0   && `${banner.prepCount} prep tasks`,
                        banner.allergenCount > 0 && `${banner.allergenCount} allergen risks`,
                        banner.haccpCount > 0  && `${banner.haccpCount} critical HACCP`,
                        banner.termCount > 0   && `${banner.termCount} terms decoded`,
                        banner.aiUsed          && "AI enhanced",
                      ].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Menu + prep list + allergen/HACCP/glossary cards */}
            {hasParsed && !importLoading && (
              <>
                {renderMenu()}
                {renderPrepList()}
                {renderAllergenWarnings()}
                {renderHACCPNotes()}
                {renderTerminologyGlossary()}
              </>
            )}

            {/* Form fields */}
            {hasParsed && !importLoading && renderFormFields(true)}

            {hasParsed && (
              <Pressable style={[s.secondaryBtn, { marginTop: 16 }]} onPress={handleClearImport}>
                <Text style={s.secondaryBtnText}>Clear and start over</Text>
              </Pressable>
            )}
          </>
        )}

        {/* ── MANUAL ENTRY TAB ──────────────────────────────────────────── */}
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
