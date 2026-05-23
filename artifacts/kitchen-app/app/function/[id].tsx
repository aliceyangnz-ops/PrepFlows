import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import QRCode from "react-native-qrcode-svg";
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
import { ACCESS_LEVEL_LABELS, DietaryRequirement, FunctionType, getAccessLevel, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

const FUNCTION_TYPES: FunctionType[] = [
  "A-la-carte", "Set Menu", "Buffet", "Cocktail", "Canapés", "Canapés + A-la-carte", "School Ball", "High Tea",
];

function getFunctionTypeColor(type: FunctionType): string {
  switch (type) {
    case "A-la-carte":            return "#F59E0B";
    case "Buffet":                return "#3B82F6";
    case "Cocktail":              return "#8B5CF6";
    case "Canapés":               return "#22C55E";
    case "Canapés + A-la-carte":  return "#F97316";
    case "School Ball":           return "#EC4899";
    case "Set Menu":              return "#14B8A6";
    case "High Tea":              return "#F43F5E";
    default:                      return "#6B7A94";
  }
}

function getDietaryColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gluten"))                     return "#22C55E";
  if (n.includes("vegan"))                      return "#84CC16";
  if (n.includes("vegetarian"))                 return "#4ADE80";
  if (n.includes("nut"))                        return "#F59E0B";
  if (n.includes("dairy"))                      return "#60A5FA";
  if (n.includes("shellfish") || n.includes("seafood")) return "#F97316";
  if (n.includes("halal"))                      return "#14B8A6";
  if (n.includes("kosher"))                     return "#8B5CF6";
  if (n.includes("egg"))                        return "#FCD34D";
  return "#94A3B8";
}

function getCategoryStyle(category: string): { color: string; icon: React.ComponentProps<typeof Feather>["name"]; label: string; prominent: boolean } {
  switch (category) {
    case "setup":   return { color: "#F59E0B", icon: "tool",         label: "PREP",    prominent: false };
    case "venue":   return { color: "#3B82F6", icon: "map-pin",      label: "VENUE",   prominent: false };
    case "brief":   return { color: "#8B5CF6", icon: "users",        label: "BRIEF",   prominent: false };
    case "service": return { color: "#F97316", icon: "star",         label: "SERVICE", prominent: true  };
    case "close":   return { color: "#22C55E", icon: "check-circle", label: "CLOSE",   prominent: false };
    default:        return { color: "#6B7A94", icon: "circle",       label: "",        prominent: false };
  }
}

interface DraftFunction {
  name: string;
  room: string;
  floor: string;
  functionType: FunctionType;
  startTime: string;
  endTime: string;
  guestCount: string;
  chefInCharge: string;
  serviceEvents: Array<{ time: string; label: string }>;
  dietaryRequirements: DietaryRequirement[];
  menu: string[];
}


export default function FunctionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, staff, prepItems, currentStaffId, toggleTimelineItem, updateFunction, generatePrepItems } = useKitchen();

  const fn = functions.find((f) => f.id === id);
  const currentMember = staff.find((s) => s.id === currentStaffId) ?? null;
  const accessLevel  = currentMember ? getAccessLevel(currentMember) : "staff";
  const canManage    = accessLevel === "manager";
  const canLead      = accessLevel === "manager" || accessLevel === "team_leader";
  const canEdit      = canLead;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftFunction | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [expandedDietary, setExpandedDietary] = useState<string | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    if (fn) {
      setDraft({
        name: fn.name,
        room: fn.room,
        floor: fn.floor,
        functionType: fn.functionType,
        startTime: fn.startTime,
        endTime: fn.endTime,
        guestCount: String(fn.guestCount),
        chefInCharge: fn.chefInCharge ?? "",
        serviceEvents: fn.serviceEvents
          ? fn.serviceEvents.map((e) => ({ ...e }))
          : fn.serviceTimes
            ? (["amuse", "entree", "main", "dessert", "supper"] as const)
                .filter((k) => fn.serviceTimes![k])
                .map((k) => ({ time: fn.serviceTimes![k]!, label: k.charAt(0).toUpperCase() + k.slice(1) }))
            : [],
        dietaryRequirements: fn.dietaryRequirements ? fn.dietaryRequirements.map(d => ({ ...d })) : [],
        menu: fn.menu ? [...fn.menu] : [],
      });
    }
  }, [fn?.id]);

  if (!fn || !draft) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Event not found</Text>
      </View>
    );
  }

  const fnStaff = staff.filter((s) => fn.teamIds.includes(s.id));
  const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
  const prepDone = fnPrep.filter((p) => p.completed).length;
  const stepsDone = fn.timeline.filter((t) => t.completed).length;
  const tc = getFunctionTypeColor(editing ? draft.functionType : fn.functionType);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Determine status
  const now = new Date();
  const startTimeStr = fn.startTime; // e.g. "18:00"
  const endTimeStr = fn.endTime; // e.g. "22:00"
  const [startH, startM] = startTimeStr.split(":").map(Number);
  const [endH, endM] = endTimeStr.split(":").map(Number);
  
  const startDate = new Date(); startDate.setHours(startH, startM, 0);
  const endDate = new Date(); endDate.setHours(endH, endM, 0);
  
  let status: "Upcoming" | "LIVE" | "Done" = "Upcoming";
  if (now > endDate) status = "Done";
  else if (now >= startDate) status = "LIVE";

  const statusColor = status === "LIVE" ? "#EAB308" : status === "Done" ? "#22C55E" : "#3B82F6";

  const dietaryReqs = fn.dietaryRequirements ?? [];
  const totalDietary = dietaryReqs.reduce((sum, d) => sum + d.count, 0);

  const hasSevereAllergen = dietaryReqs.some(
    (d) => d.name.toLowerCase().includes("nut") || d.name.toLowerCase().includes("shellfish")
  );

  const timeChanged =
    fn.startTime !== draft.startTime ||
    fn.endTime   !== draft.endTime   ||
    JSON.stringify(fn.serviceEvents ?? []) !== JSON.stringify(draft.serviceEvents);

  function updateDraft(field: keyof DraftFunction, value: string) {
    setDraft((d) => d ? { ...d, [field]: value } : d);
    setHasUnsaved(true);
  }

  function updateDietaryCount(idx: number, count: string) {
    setDraft((d) => {
      if (!d) return d;
      const updated = d.dietaryRequirements.map((item, i) =>
        i === idx ? { ...item, count: parseInt(count, 10) || 0 } : item
      );
      return { ...d, dietaryRequirements: updated };
    });
    setHasUnsaved(true);
  }

  function updateDietaryNote(idx: number, note: string) {
    setDraft((d) => {
      if (!d) return d;
      const updated = d.dietaryRequirements.map((item, i) =>
        i === idx ? { ...item, note } : item
      );
      return { ...d, dietaryRequirements: updated };
    });
    setHasUnsaved(true);
  }

  function updateMenuItem(idx: number, value: string) {
    setDraft((d) => { if (!d) return d; const m = [...d.menu]; m[idx] = value; return { ...d, menu: m }; });
    setHasUnsaved(true);
  }
  function addMenuItem() {
    setDraft((d) => { if (!d) return d; return { ...d, menu: [...d.menu, ""] }; });
    setHasUnsaved(true);
  }
  function removeMenuItem(idx: number) {
    setDraft((d) => { if (!d) return d; return { ...d, menu: d.menu.filter((_, i) => i !== idx) }; });
    setHasUnsaved(true);
  }

  function addDietaryReq() {
    setDraft((d) => {
      if (!d) return d;
      return { ...d, dietaryRequirements: [...d.dietaryRequirements, { name: "New Requirement", count: 1, note: "" }] };
    });
    setHasUnsaved(true);
  }

  function removeDietaryReq(idx: number) {
    setDraft((d) => {
      if (!d) return d;
      return { ...d, dietaryRequirements: d.dietaryRequirements.filter((_, i) => i !== idx) };
    });
    setHasUnsaved(true);
  }

  function updateDietaryName(idx: number, name: string) {
    setDraft((d) => {
      if (!d) return d;
      const updated = d.dietaryRequirements.map((item, i) =>
        i === idx ? { ...item, name } : item
      );
      return { ...d, dietaryRequirements: updated };
    });
    setHasUnsaved(true);
  }

  function handleSave() {
    if (!draft || !fn) return;
    if (!canEdit) {
      Alert.alert("Access denied", "You don't have permission to edit this event.");
      return;
    }
    const guestNum = parseInt(draft.guestCount, 10);
    if (isNaN(guestNum) || guestNum < 1) {
      Alert.alert("Invalid guest count", "Please enter a valid number of guests.");
      return;
    }
    updateFunction(fn.id, {
      name:             draft.name.trim()      || fn.name,
      room:             draft.room.trim()      || fn.room,
      floor:            draft.floor.trim()     || fn.floor,
      functionType:     draft.functionType,
      startTime:        draft.startTime.trim() || fn.startTime,
      endTime:          draft.endTime.trim()   || fn.endTime,
      guestCount:       guestNum,
      chefInCharge:     draft.chefInCharge.trim() || undefined,
      menu: draft.menu.filter((m) => m.trim()),
      dietaryRequirements: draft.dietaryRequirements.filter((d) => d.count > 0 && d.name.trim()),
      serviceEvents: draft.serviceEvents
        .filter((e) => e.time.trim() && e.label.trim())
        .sort((a, b) => a.time.localeCompare(b.time)),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
    setHasUnsaved(false);
    Alert.alert("Saved", "Function updated — all team members will see the changes.", [{ text: "OK" }]);
  }

  function handleCancelEdit() {
    if (!fn) { setEditing(false); return; }
    if (hasUnsaved) {
      const snap = fn;
      Alert.alert("Discard changes?", "You have unsaved changes.", [
        { text: "Keep editing", style: "cancel" },
        {
          text: "Discard", style: "destructive", onPress: () => {
            setDraft({
              name: snap.name, room: snap.room, floor: snap.floor, functionType: snap.functionType,
              startTime: snap.startTime, endTime: snap.endTime, guestCount: String(snap.guestCount),
              chefInCharge: snap.chefInCharge ?? "",
              serviceEvents: snap.serviceEvents
                ? snap.serviceEvents.map((e) => ({ ...e }))
                : snap.serviceTimes
                  ? (["amuse", "entree", "main", "dessert", "supper"] as const)
                      .filter((k) => snap.serviceTimes![k])
                      .map((k) => ({ time: snap.serviceTimes![k]!, label: k.charAt(0).toUpperCase() + k.slice(1) }))
                  : [],
              dietaryRequirements: snap.dietaryRequirements ? snap.dietaryRequirements.map((d) => ({ ...d })) : [],
              menu: snap.menu ? [...snap.menu] : [],
            });
            setEditing(false); setHasUnsaved(false);
          },
        },
      ]);
    } else {
      setEditing(false);
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case "Head Chef":        return colors.primary;
      case "Sous Chef":        return colors.info;
      case "Pastry Chef":      return "#A78BFA";
      case "Function Captain": return "#3B82F6";
      case "Casual":           return colors.warning;
      default:                 return colors.mutedForeground;
    }
  }

  // Parse menu line into: course, dish, tags
  function parseMenuLine(line: string): { course: string; name: string; desc: string; tags: string[] } {
    const pipeIdx = line.indexOf("|");
    const main = pipeIdx > -1 ? line.slice(0, pipeIdx).trim() : line;
    const tagStr = pipeIdx > -1 ? line.slice(pipeIdx + 1) : "";
    const tags = tagStr.split("|").map((t) => t.trim()).filter((t) => !t.toLowerCase().startsWith("alt:"));
    const colonIdx = main.indexOf(":");
    const full = colonIdx > -1 ? main.slice(colonIdx + 1).trim() : main;
    const course = colonIdx > -1 ? main.slice(0, colonIdx).trim() : "";
    const dashIdx = full.indexOf(" — ");
    const name = dashIdx > -1 ? full.slice(0, dashIdx).trim() : full;
    const desc = dashIdx > -1 ? full.slice(dashIdx + 3).trim() : "";
    return { course, name, desc, tags };
  }

  const activeCourses: Array<{ label: string; time: string }> = fn.serviceEvents && fn.serviceEvents.length > 0
    ? fn.serviceEvents
    : fn.serviceTimes
      ? (["amuse", "entree", "main", "dessert", "supper"] as const)
          .filter((k) => fn.serviceTimes![k])
          .map((k) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), time: fn.serviceTimes![k]! }))
      : [];

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    toolbar: { position: "absolute", top: topPad + 8, left: 0, right: 0, zIndex: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 },
    backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
    headerTitleContainer: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
    statusBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8, textTransform: "uppercase" },
    toolbarSpacer: { flex: 1 },
    editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    editBtnText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.accent },
    saveBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    cancelBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
    cancelBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    hero: { paddingTop: topPad + 62, paddingHorizontal: 20, paddingBottom: 24, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    typePill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
    typeText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
    eventName: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4, lineHeight: 28 },
    roomRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 20 },
    roomLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    roomValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    floorTag: { marginLeft: 4 },
    floorTagText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    infoGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
    infoBox: { flex: 1, backgroundColor: "#161B22", borderRadius: 10, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    infoNum: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    infoLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 },
    statsRow: { flexDirection: "row", gap: 8 },
    statBox: { flex: 1, backgroundColor: "#161B22", borderRadius: 10, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    statNum: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    statLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.7, marginTop: 4 },
    banner: { marginHorizontal: 20, marginTop: 8, padding: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 8 },
    bannerText: { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold" },
    courseCard: { marginHorizontal: 20, marginTop: 16, borderRadius: colors.radius, borderWidth: 1.5, overflow: "hidden" },
    courseCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
    courseCardTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
    courseRow: { flexDirection: "row" },
    courseBox: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6, borderRightWidth: 1 },
    courseLabel: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
    courseTime: { fontSize: 20, fontFamily: "Inter_700Bold" },
    // Dietary section
    dietaryCard: { marginHorizontal: 20, marginTop: 16, borderRadius: colors.radius, borderWidth: 1.5, overflow: "hidden" },
    dietaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
    dietaryTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold" },
    dietaryTotalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    dietaryTotalText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
    severeWarning: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
    severeText: { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold" },
    dietaryList: { padding: 10, gap: 8 },
    dietaryRow: { borderRadius: 10, overflow: "hidden", borderWidth: 1 },
    dietaryBadgeRow: { flexDirection: "row", alignItems: "center", padding: 10, gap: 10 },
    dietaryCount: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    dietaryCountText: { fontSize: 16, fontFamily: "Inter_700Bold" },
    dietaryName: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
    dietaryNoteToggle: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    dietaryNoteToggleText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    dietaryNote: { paddingHorizontal: 14, paddingBottom: 12 },
    dietaryNoteText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
    // Run sheet
    section: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 4 },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 },
    sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 14 },
    div: { height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginTop: 16 },
    runSheetContainer: { paddingHorizontal: 12, paddingBottom: 12 },
    runSheetItem: { flexDirection: "row", alignItems: "center", gap: 0, marginBottom: 0 },
    runSheetLine: { width: 2, flex: 1, position: "absolute", left: 57, top: 0, bottom: 0 },
    timeCol: { width: 60, alignItems: "flex-start", paddingLeft: 8, paddingVertical: 16 },
    timeText: { fontSize: 12, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", color: "#484F58" },
    iconCol: { width: 24, alignItems: "center", justifyContent: "center", zIndex: 1 },
    iconDot: { width: 10, height: 10, borderRadius: 5 },
    activeHighlight: { backgroundColor: "rgba(234,179,8,0.06)", borderLeftWidth: 2, borderLeftColor: "#EAB308" },
    taskCard: { flex: 1, paddingHorizontal: 12, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 8 },
    taskText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
    catBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.05)" },
    catBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5, color: colors.mutedForeground },
    // Menu
    menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    menuCourse: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 },
    menuDishName: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 3 },
    menuDishDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 19, marginBottom: 7 },
    menuTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
    menuTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    menuTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    // Staff
    memberRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    memberAvatarText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    memberName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    memberRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    memberNum: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 1 },
    memberShift: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    overflowPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: colors.secondary },
    overflowText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    // Edit mode
    editCard: { marginHorizontal: 20, marginTop: 14, borderRadius: colors.radius, borderWidth: 1.5, overflow: "hidden" },
    editCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
    editCardTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_700Bold" },
    fieldRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 50 },
    fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, width: 80 },
    fieldInput: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 10 },
    typeSelectRow: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    typeSelectLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 },
    typeChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    typeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
    typeChipText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    courseEditRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 46 },
    courseEditLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", width: 110 },
    courseEditInput: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold", paddingVertical: 8 },
    editHint: { paddingHorizontal: 14, paddingVertical: 10 },
    editHintText: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    dietaryEditRow: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 6 },
    dietaryEditNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dietaryEditNameInput: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
    dietaryEditCountRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dietaryEditCountLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    dietaryEditCountInput: { width: 60, fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 4 },
    dietaryEditNoteInput: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
    addDietaryBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
    addDietaryText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 40 },
  });

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Toolbar */}
      <View style={s.toolbar}>
        <Pressable
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => { if (editing && hasUnsaved) { handleCancelEdit(); } else { router.back(); } }}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        {!editing && (
          <View style={s.headerTitleContainer}>
            <Text style={s.headerTitle} numberOfLines={1}>{fn.name}</Text>
            <View style={[s.statusBadge, { borderColor: statusColor + "40", backgroundColor: statusColor + "15" }]}>
              <Text style={[s.statusBadgeText, { color: statusColor }]}>● {status}</Text>
            </View>
          </View>
        )}
        <View style={s.toolbarSpacer} />
        {!editing && (
          <Pressable
            style={({ pressed }) => [s.editBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1, marginRight: 6 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/prep-print/${fn.id}`); }}
          >
            <Feather name="printer" size={14} color={colors.mutedForeground} />
            <Text style={[s.editBtnText, { color: colors.mutedForeground }]}>Print</Text>
          </Pressable>
        )}
        {canEdit && !editing && (
          <Pressable
            style={({ pressed }) => [s.editBtn, { backgroundColor: colors.card, borderColor: colors.primary + "60", opacity: pressed ? 0.7 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEditing(true); }}
          >
            <Feather name="edit-2" size={14} color={colors.primary} />
            <Text style={[s.editBtnText, { color: colors.primary }]}>Edit</Text>
          </Pressable>
        )}
        {editing && (
          <>
            <Pressable style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.7 }]} onPress={handleCancelEdit}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [s.saveBtn, pressed && { opacity: 0.8 }]} onPress={handleSave}>
              <Feather name="check" size={14} color="#fff" />
              <Text style={s.saveBtnText}>Save</Text>
            </Pressable>
          </>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={[s.typePill, { backgroundColor: tc + "15", borderColor: tc + "40" }]}>
            <Text style={[s.typeText, { color: tc }]}>{editing ? draft.functionType : fn.functionType}</Text>
          </View>
          <Text style={s.eventName}>{editing ? draft.name || fn.name : fn.name}</Text>
          <View style={s.roomRow}>
            <Text style={s.roomLabel}>Room </Text>
            <Text style={s.roomValue}>{editing ? draft.room || fn.room : fn.room}</Text>
            <View style={s.floorTag}>
              <Text style={s.floorTagText}>· {editing ? draft.floor || fn.floor : fn.floor}</Text>
            </View>
          </View>
          <View style={s.infoGrid}>
            <View style={s.infoBox}>
              <Text style={s.infoNum}>{editing ? draft.guestCount : fn.guestCount}</Text>
              <Text style={s.infoLabel}>Guests</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={s.infoNum}>{editing ? draft.startTime : fn.startTime}</Text>
              <Text style={s.infoLabel}>Start</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={s.infoNum}>{editing ? draft.endTime : fn.endTime}</Text>
              <Text style={s.infoLabel}>Finish</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={s.infoNum}>{editing ? draft.functionType.split(" ")[0] : fn.functionType.split(" ")[0]}</Text>
              <Text style={s.infoLabel}>Type</Text>
            </View>
          </View>
        </View>

        {/* Time changed banner */}
        {!editing && timeChanged && (
          <View style={[s.banner, { backgroundColor: "#F59E0B20", borderWidth: 1, borderColor: "#F59E0B60" }]}>
            <Ionicons name="time" size={16} color="#F59E0B" />
            <Text style={[s.bannerText, { color: "#F59E0B" }]}>Times have been updated — check the run sheet below</Text>
          </View>
        )}

        {/* ── EDIT MODE ──────────────────────────────────────────────────────── */}
        {editing && (
          <>
            {/* Function details */}
            <View style={[s.editCard, { borderColor: colors.primary + "60" }]}>
              <View style={[s.editCardHeader, { backgroundColor: colors.primary + "15", borderBottomColor: colors.primary + "30" }]}>
                <Feather name="edit-2" size={14} color={colors.primary} />
                <Text style={[s.editCardTitle, { color: colors.primary }]}>Function Details</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.primary }}>
                {currentMember ? ACCESS_LEVEL_LABELS[accessLevel] : ""}
              </Text>
              </View>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Name</Text>
                <TextInput style={s.fieldInput} value={draft.name} onChangeText={(v) => updateDraft("name", v)} placeholder={fn.name} placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Room</Text>
                <TextInput style={s.fieldInput} value={draft.room} onChangeText={(v) => updateDraft("room", v)} placeholder={fn.room} placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Floor</Text>
                <TextInput style={s.fieldInput} value={draft.floor} onChangeText={(v) => updateDraft("floor", v)} placeholder={fn.floor} placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Guests</Text>
                <TextInput style={s.fieldInput} value={draft.guestCount} onChangeText={(v) => updateDraft("guestCount", v)} keyboardType="number-pad" placeholder={String(fn.guestCount)} placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Start time</Text>
                <TextInput style={s.fieldInput} value={draft.startTime} onChangeText={(v) => updateDraft("startTime", v)} placeholder="HH:MM" placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Finish time</Text>
                <TextInput style={s.fieldInput} value={draft.endTime} onChangeText={(v) => updateDraft("endTime", v)} placeholder="HH:MM" placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Chef in Charge</Text>
                <TextInput style={s.fieldInput} value={draft.chefInCharge} onChangeText={(v) => updateDraft("chefInCharge", v)} placeholder="e.g. Marco Russo" placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={s.typeSelectRow}>
                <Text style={s.typeSelectLabel}>Function Type</Text>
                <View style={s.typeChipRow}>
                  {FUNCTION_TYPES.map((type) => {
                    const ftc = getFunctionTypeColor(type);
                    const selected = draft.functionType === type;
                    return (
                      <Pressable key={type} style={[s.typeChip, { backgroundColor: selected ? ftc + "25" : "transparent", borderColor: selected ? ftc : colors.border }]} onPress={() => updateDraft("functionType", type)}>
                        <Text style={[s.typeChipText, { color: selected ? ftc : colors.mutedForeground }]}>{type}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Function Menu — managers only */}
            {canManage && (
              <View style={[s.editCard, { borderColor: "#22C55E60", marginTop: 10 }]}>
                <View style={[s.editCardHeader, { backgroundColor: "#22C55E15", borderBottomColor: "#22C55E30" }]}>
                  <Feather name="coffee" size={14} color="#22C55E" />
                  <Text style={[s.editCardTitle, { color: "#22C55E" }]}>Function Menu</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Manager / Head Office only</Text>
                </View>
                <View style={{ paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.secondary }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 17 }}>
                    Format: <Text style={{ fontFamily: "Inter_600SemiBold" }}>Course: Dish Name — description | Tag | Tag</Text>{"\n"}
                    e.g. Entrée: Tiger Prawn Cocktail — Marie Rose sauce | GF | Alt: smoked salmon
                  </Text>
                </View>
                {draft.menu.map((item, idx) => (
                  <View key={idx} style={[s.fieldRow, { alignItems: "flex-start", paddingVertical: 10 }]}>
                    <Text style={[s.fieldLabel, { paddingTop: 4, fontSize: 11 }]}>Course {idx + 1}</Text>
                    <TextInput
                      style={[s.fieldInput, { fontSize: 13, lineHeight: 20 }]}
                      value={item}
                      onChangeText={(v) => updateMenuItem(idx, v)}
                      placeholder="e.g. Main: Beef Fillet — béarnaise, gratin | GF"
                      placeholderTextColor={colors.mutedForeground}
                      multiline
                    />
                    <Pressable onPress={() => removeMenuItem(idx)} style={{ paddingTop: 4, paddingLeft: 8 }}>
                      <Feather name="x" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 14 }}
                  onPress={addMenuItem}
                >
                  <Feather name="plus-circle" size={16} color="#22C55E" />
                  <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#22C55E" }}>Add menu item</Text>
                </Pressable>
              </View>
            )}

            {/* Service Timetable editor */}
            <View style={[s.editCard, { borderColor: tc + "60", marginTop: 10 }]}>
              <View style={[s.editCardHeader, { backgroundColor: tc + "15", borderBottomColor: tc + "30" }]}>
                <Feather name="clock" size={14} color={tc} />
                <Text style={[s.editCardTitle, { color: tc }]}>Service Timetable</Text>
                <Pressable
                  style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: tc + "25" }}
                  onPress={() => {
                    if (!pasteMode) {
                      setPasteText(draft.serviceEvents.map((e) => `${e.time} ${e.label}`).join("\n"));
                    } else {
                      const parsed = pasteText
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                          const m = line.match(/^(\d{1,2}:\d{2})\s+(.+)$/);
                          return m ? { time: m[1].length === 4 ? "0" + m[1] : m[1], label: m[2].trim() } : null;
                        })
                        .filter(Boolean) as Array<{ time: string; label: string }>;
                      setDraft((d) => d ? { ...d, serviceEvents: parsed } : d);
                      setHasUnsaved(true);
                    }
                    setPasteMode((v) => !v);
                  }}
                >
                  <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: tc }}>{pasteMode ? "Done" : "Paste mode"}</Text>
                </Pressable>
              </View>
              {pasteMode ? (
                <View style={{ padding: 14 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 8, lineHeight: 16 }}>
                    Each line: <Text style={{ fontFamily: "Inter_600SemiBold" }}>HH:MM Description</Text>{"\n"}
                    e.g.  19:00 Salad Bar Open{"\n"}
                    {"      "}19:30 Hot Food{"\n"}
                    {"      "}21:30 Buffet Closed
                  </Text>
                  <TextInput
                    style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground, borderWidth: 1, borderColor: tc + "60", borderRadius: 8, padding: 12, minHeight: 120, textAlignVertical: "top", backgroundColor: colors.secondary }}
                    value={pasteText}
                    onChangeText={(v) => { setPasteText(v); setHasUnsaved(true); }}
                    placeholder={"19:00 Guests Arrive\n19:30 Entrée Away\n20:30 Main Away\n22:00 Dessert Away\n23:00 Function Finishes"}
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <>
                  {draft.serviceEvents.map((evt, idx) => (
                    <View key={idx} style={[s.courseEditRow, { paddingVertical: 8, gap: 8 }]}>
                      <TextInput
                        style={[s.courseEditInput, { color: tc, width: 64, flexGrow: 0 }]}
                        value={evt.time}
                        onChangeText={(v) => {
                          setDraft((d) => { if (!d) return d; const ev = [...d.serviceEvents]; ev[idx] = { ...ev[idx], time: v }; return { ...d, serviceEvents: ev }; });
                          setHasUnsaved(true);
                        }}
                        placeholder="HH:MM"
                        placeholderTextColor={colors.mutedForeground}
                      />
                      <TextInput
                        style={[s.courseEditInput, { color: colors.foreground, flex: 1 }]}
                        value={evt.label}
                        onChangeText={(v) => {
                          setDraft((d) => { if (!d) return d; const ev = [...d.serviceEvents]; ev[idx] = { ...ev[idx], label: v }; return { ...d, serviceEvents: ev }; });
                          setHasUnsaved(true);
                        }}
                        placeholder="e.g. Entrée Away"
                        placeholderTextColor={colors.mutedForeground}
                      />
                      <Pressable onPress={() => { setDraft((d) => { if (!d) return d; return { ...d, serviceEvents: d.serviceEvents.filter((_, i) => i !== idx) }; }); setHasUnsaved(true); }}>
                        <Feather name="x" size={16} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable
                    style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12 }}
                    onPress={() => { setDraft((d) => { if (!d) return d; return { ...d, serviceEvents: [...d.serviceEvents, { time: "", label: "" }] }; }); setHasUnsaved(true); }}
                  >
                    <Feather name="plus-circle" size={16} color={tc} />
                    <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: tc }}>Add row</Text>
                  </Pressable>
                </>
              )}
            </View>

            {/* Dietary requirements edit */}
            <View style={[s.editCard, { borderColor: "#F59E0B60", marginTop: 10 }]}>
              <View style={[s.editCardHeader, { backgroundColor: "#F59E0B15", borderBottomColor: "#F59E0B30" }]}>
                <Ionicons name="warning" size={14} color="#F59E0B" />
                <Text style={[s.editCardTitle, { color: "#F59E0B" }]}>Dietary Requirements</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Set count to 0 to remove</Text>
              </View>
              {draft.dietaryRequirements.map((req, idx) => {
                const dc = getDietaryColor(req.name);
                return (
                  <View key={idx} style={s.dietaryEditRow}>
                    <View style={s.dietaryEditNameRow}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dc, marginTop: 2 }} />
                      <TextInput style={[s.dietaryEditNameInput, { color: dc }]} value={req.name} onChangeText={(v) => updateDietaryName(idx, v)} placeholder="Requirement name" placeholderTextColor={colors.mutedForeground} />
                      <Pressable onPress={() => removeDietaryReq(idx)}>
                        <Feather name="x" size={16} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                    <View style={s.dietaryEditCountRow}>
                      <Text style={s.dietaryEditCountLabel}>Number of guests:</Text>
                      <TextInput style={s.dietaryEditCountInput} value={String(req.count)} onChangeText={(v) => updateDietaryCount(idx, v)} keyboardType="number-pad" />
                    </View>
                    <TextInput style={s.dietaryEditNoteInput} value={req.note ?? ""} onChangeText={(v) => updateDietaryNote(idx, v)} placeholder="Special instructions (optional)" placeholderTextColor={colors.mutedForeground} multiline />
                  </View>
                );
              })}
              <Pressable style={s.addDietaryBtn} onPress={addDietaryReq}>
                <Feather name="plus-circle" size={16} color={colors.primary} />
                <Text style={s.addDietaryText}>Add dietary requirement</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* ── VIEW MODE ──────────────────────────────────────────────────────── */}
        {!editing && (
          <>
            {/* Live Service button — shown to managers/team leaders when function is active or starting soon */}
            {canLead && status !== "Done" && (
              <Pressable
                style={({ pressed }) => ({
                  marginHorizontal: 20,
                  marginTop: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  paddingVertical: 16,
                  borderRadius: colors.radius,
                  backgroundColor: status === "LIVE" ? "#F97316" : "#F97316" + "20",
                  borderWidth: status === "LIVE" ? 0 : 1.5,
                  borderColor: "#F97316" + "60",
                  opacity: pressed ? 0.85 : 1,
                })}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  router.push(`/service/${fn.id}`);
                }}
              >
                <Text style={{ fontSize: 18 }}>🔥</Text>
                <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: status === "LIVE" ? "#fff" : "#F97316" }}>
                  {status === "LIVE" ? "LIVE — Open Service Mode" : "Open Service Mode"}
                </Text>
                {status === "LIVE" && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" }} />
                )}
              </Pressable>
            )}

            {/* Chef in Charge banner */}
            {fn.chefInCharge ? (
              <View style={{ marginHorizontal: 20, marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: colors.radius, backgroundColor: colors.primary + "15", borderWidth: 1, borderColor: colors.primary + "40" }}>
                <Feather name="user" size={14} color={colors.primary} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.primary, textTransform: "uppercase", letterSpacing: 0.9 }}>Chef in Charge</Text>
                <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1 }}>{fn.chefInCharge}</Text>
              </View>
            ) : canManage ? (
              <View style={{ marginHorizontal: 20, marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed" }}>
                <Feather name="user" size={13} color={colors.mutedForeground} />
                <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, flex: 1 }}>No chef in charge set — tap Edit to assign one.</Text>
              </View>
            ) : null}

            {/* ── Service Timetable ──────────────────────────────────── */}
            <View style={{ marginHorizontal: 20, marginTop: 14, borderRadius: colors.radius, borderWidth: 1.5, borderColor: tc + "55", overflow: "hidden" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: tc + "15", borderBottomWidth: 1, borderBottomColor: tc + "30" }}>
                <Feather name="clock" size={14} color={tc} />
                <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: tc }}>Service Timetable — {fn.functionType}</Text>
              </View>
              {/* Arrive row */}
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.info, width: 68 }}>{fn.startTime}</Text>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.info, marginRight: 12 }} />
                <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Guests Arrive</Text>
              </View>
              {/* Service events */}
              {activeCourses.map((c, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: tc, width: 68 }}>{c.time}</Text>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: tc, marginRight: 12 }} />
                  <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{c.label}</Text>
                </View>
              ))}
              {activeCourses.length === 0 && (
                <View style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{canManage ? "No milestones added yet — tap Edit to set the timetable." : "Check with your manager for the service timetable."}</Text>
                </View>
              )}
              {/* Finish row */}
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 }}>
                <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.mutedForeground, width: 68 }}>{fn.endTime}</Text>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.mutedForeground, marginRight: 12 }} />
                <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>Function Finishes</Text>
              </View>
            </View>

            {/* ── Card 1: Function Menu + Dietary Tags ──────────────── */}
            <View style={{ marginHorizontal: 20, marginTop: 14, borderRadius: colors.radius, borderWidth: 1.5, borderColor: "#22C55E55", overflow: "hidden" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#22C55E15", borderBottomWidth: 1, borderBottomColor: "#22C55E30" }}>
                <Feather name="book-open" size={14} color="#22C55E" />
                <Text style={{ flex: 1, fontSize: 13, fontFamily: "Inter_700Bold", color: "#22C55E" }}>Function Menu</Text>
                {canManage && fn.menu.length > 0 && (
                  <Pressable
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#22C55E20", borderRadius: 6, opacity: pressed ? 0.7 : 1 })}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert("Generate Prep List", `Auto-create prep tasks for ${fn.menu.length} menu items?\n\nAny previous auto-generated prep for this function will be replaced.`, [
                        { text: "Cancel", style: "cancel" },
                        { text: "Generate", onPress: () => { generatePrepItems(fn.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Done", "Prep tasks added to the Prep tab."); } },
                      ]);
                    }}
                  >
                    <Feather name="list" size={11} color="#22C55E" />
                    <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "#22C55E" }}>Auto Prep</Text>
                  </Pressable>
                )}
              </View>
              {/* Dietary tags row */}
              {dietaryReqs.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 14, paddingTop: 10, paddingBottom: fn.menu.length > 0 ? 6 : 12 }}>
                  {dietaryReqs.map((req, idx) => {
                    const dc = getDietaryColor(req.name);
                    const isSevere = req.name.toLowerCase().includes("nut") || req.name.toLowerCase().includes("shellfish");
                    return (
                      <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: dc + "20", borderWidth: 1, borderColor: dc + "50" }}>
                        {isSevere && <Ionicons name="warning" size={10} color={dc} />}
                        <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: dc }}>{req.name.toUpperCase()}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
              {/* Menu items */}
              {fn.menu.length === 0 ? (
                <View style={{ paddingHorizontal: 14, paddingVertical: 16 }}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{canManage ? "No menu added yet — tap Edit to add dishes." : "Menu not yet set. Check with your manager."}</Text>
                </View>
              ) : (
                <View style={{ paddingHorizontal: 14, paddingBottom: 4 }}>
                  {fn.menu.map((line, i) => {
                    const { course, name, desc, tags } = parseMenuLine(line);
                    return (
                      <View key={i} style={{ paddingVertical: 12, borderBottomWidth: i < fn.menu.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                        {course ? <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: tc, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 }}>{course}</Text> : null}
                        <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: desc ? 3 : 0 }}>{name}</Text>
                        {desc ? <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 19, marginBottom: tags.length > 0 ? 7 : 0 }}>{desc}</Text> : null}
                        {tags.length > 0 && (
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                            {tags.map((tag, ti) => {
                              const tagColor = getDietaryColor(tag);
                              return (
                                <View key={ti} style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: tagColor + "20" }}>
                                  <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: tagColor }}>{tag}</Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* ── Card 2: Dietary Requests ───────────────────────────── */}
            {dietaryReqs.length > 0 && (
              <View style={{ marginHorizontal: 20, marginTop: 14, borderRadius: colors.radius, borderWidth: 1.5, borderColor: hasSevereAllergen ? "#EF444480" : "#F59E0B60", overflow: "hidden" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: hasSevereAllergen ? "#EF444415" : "#F59E0B15", borderBottomWidth: 1, borderBottomColor: hasSevereAllergen ? "#EF444430" : "#F59E0B30" }}>
                  <Ionicons name="warning" size={14} color={hasSevereAllergen ? "#EF4444" : "#F59E0B"} />
                  <Text style={{ flex: 1, fontSize: 13, fontFamily: "Inter_700Bold", color: hasSevereAllergen ? "#EF4444" : "#F59E0B" }}>
                    Dietary Requests{hasSevereAllergen ? " — SEVERE ALLERGEN" : ""}
                  </Text>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: hasSevereAllergen ? "#EF4444" : "#F59E0B" }}>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" }}>{totalDietary} guests</Text>
                  </View>
                </View>
                {dietaryReqs.some(d => d.name.toLowerCase().includes("nut")) && (
                  <View style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "rgba(239,68,68,0.05)" }}>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: "#EF4444" }}>⚠ Confirm nut allergy with kitchen</Text>
                  </View>
                )}
                <View style={{ padding: 10, gap: 8 }}>
                  {dietaryReqs.map((req, idx) => {
                    let dc = getDietaryColor(req.name);
                    let bg = dc + "12";
                    let border = dc + "20";
                    let isNut = req.name.toLowerCase().includes("nut");
                    let isGF = req.name.toLowerCase().includes("gluten");
                    let isVegan = req.name.toLowerCase().includes("vegan") || req.name.toLowerCase().includes("vegetarian");

                    if (isNut) { dc = "#EF4444"; bg = "rgba(239,68,68,0.15)"; border = "rgba(239,68,68,0.3)"; }
                    else if (isGF) { dc = "#EAB308"; bg = "rgba(234,179,8,0.12)"; border = "rgba(234,179,8,0.2)"; }
                    else if (isVegan) { dc = "#22C55E"; bg = "rgba(34,197,94,0.12)"; border = "rgba(34,197,94,0.2)"; }

                    const isExpanded = expandedDietary === req.name + idx;
                    return (
                      <View key={idx} style={{ borderRadius: 10, overflow: "hidden", borderWidth: 1, backgroundColor: bg, borderColor: border }}>
                        <View style={{ flexDirection: "row", alignItems: "center", padding: 10, gap: 10 }}>
                          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: dc + "25", alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: dc }}>{req.count}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: dc }}>{req.name.toUpperCase()}{isNut ? " ⚠" : ""}</Text>
                            {req.note ? (
                              <Pressable onPress={() => setExpandedDietary(isExpanded ? null : req.name + idx)}>
                                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: dc, marginTop: 2 }}>{isExpanded ? "▲ Hide details" : "▼ View special instructions"}</Text>
                              </Pressable>
                            ) : (
                              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: dc, opacity: 0.7, marginTop: 2 }}>Standard {req.name} menu</Text>
                            )}
                          </View>
                        </View>
                        {isExpanded && req.note ? (
                          <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: dc, lineHeight: 19 }}>{req.note}</Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={s.div} />

            {/* ── Staff ───────────────────────────────────────────────────── */}
            <View style={s.section}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={s.sectionTitle}>Team</Text>
                {fnStaff.length > 0 && <Text style={{ fontSize: 13, color: colors.mutedForeground, fontWeight: "500" }}>{fnStaff.length} staff</Text>}
              </View>
              {fnStaff.length === 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 }}>
                  <Feather name="info" size={14} color={colors.mutedForeground} />
                  <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, flex: 1 }}>
                    {canManage ? "Add staff to this function via the Roster tab, then assign them here." : "Speak to your manager for your team assignment."}
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {fnStaff.slice(0, 5).map((member) => {
                  const rc = getRoleColor(member.role);
                  return (
                    <View key={member.id} style={{ alignItems: "center", width: 60 }}>
                      <View style={[s.memberAvatar, { backgroundColor: rc }]}>
                        <Text style={[s.memberAvatarText, { color: "#fff" }]}>
                          {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4, textAlign: "center" }} numberOfLines={1}>
                        {member.name.split(" ")[0]}
                      </Text>
                    </View>
                  );
                })}
                {fnStaff.length > 5 && (
                  <View style={s.overflowPill}>
                    <Text style={s.overflowText}>+{fnStaff.length - 5} more</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
