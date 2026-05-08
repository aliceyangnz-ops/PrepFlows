import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { DietaryRequirement, FunctionType, MANAGER_ROLES, useKitchen } from "@/context/KitchenContext";
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
  entree: string;
  main: string;
  dessert: string;
  amuse: string;
  supper: string;
  dietaryRequirements: DietaryRequirement[];
}


export default function FunctionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, staff, prepItems, currentStaffId, toggleTimelineItem, updateFunction } = useKitchen();

  const fn = functions.find((f) => f.id === id);
  const currentMember = staff.find((s) => s.id === currentStaffId) ?? null;
  const canEdit = currentMember ? (MANAGER_ROLES as readonly string[]).includes(currentMember.role) : false;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftFunction | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [expandedDietary, setExpandedDietary] = useState<string | null>(null);

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
        entree:   fn.serviceTimes?.entree   ?? "",
        main:     fn.serviceTimes?.main     ?? "",
        dessert:  fn.serviceTimes?.dessert  ?? "",
        amuse:    fn.serviceTimes?.amuse    ?? "",
        supper:   fn.serviceTimes?.supper   ?? "",
        dietaryRequirements: fn.dietaryRequirements ? fn.dietaryRequirements.map(d => ({ ...d })) : [],
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

  const dietaryReqs = fn.dietaryRequirements ?? [];
  const totalDietary = dietaryReqs.reduce((sum, d) => sum + d.count, 0);

  const hasSevereAllergen = dietaryReqs.some(
    (d) => d.name.toLowerCase().includes("nut") || d.name.toLowerCase().includes("shellfish")
  );

  const timeChanged =
    fn.startTime !== draft.startTime ||
    fn.endTime   !== draft.endTime   ||
    (fn.serviceTimes?.entree ?? "") !== draft.entree ||
    (fn.serviceTimes?.main   ?? "") !== draft.main;

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
      dietaryRequirements: draft.dietaryRequirements.filter((d) => d.count > 0 && d.name.trim()),
      serviceTimes: {
        amuse:   draft.amuse   || undefined,
        entree:  draft.entree  || undefined,
        main:    draft.main    || undefined,
        dessert: draft.dessert || undefined,
        supper:  draft.supper  || undefined,
      },
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
              entree:   snap.serviceTimes?.entree   ?? "",
              main:     snap.serviceTimes?.main     ?? "",
              dessert:  snap.serviceTimes?.dessert  ?? "",
              amuse:    snap.serviceTimes?.amuse    ?? "",
              supper:   snap.serviceTimes?.supper   ?? "",
              dietaryRequirements: snap.dietaryRequirements ? snap.dietaryRequirements.map((d) => ({ ...d })) : [],
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

  const courseOrder: Array<{ key: keyof NonNullable<typeof fn.serviceTimes>; label: string; draftKey: keyof DraftFunction }> = [
    { key: "amuse",   label: "Amuse-bouche", draftKey: "amuse"   },
    { key: "entree",  label: "Entrée",        draftKey: "entree"  },
    { key: "main",    label: "Main",          draftKey: "main"    },
    { key: "dessert", label: "Dessert",       draftKey: "dessert" },
    { key: "supper",  label: "Supper",        draftKey: "supper"  },
  ];
  const activeCourses = fn.serviceTimes
    ? courseOrder.filter((c) => fn.serviceTimes![c.key])
    : [];

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    toolbar: { position: "absolute", top: topPad + 8, left: 0, right: 0, zIndex: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8 },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    toolbarSpacer: { flex: 1 },
    editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    editBtnText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.accent },
    saveBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    cancelBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
    cancelBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    hero: { paddingTop: topPad + 62, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    typePill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5, marginBottom: 10 },
    typeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    eventName: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 12, lineHeight: 28 },
    roomRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    roomLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    roomValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    floorTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.secondary },
    floorTagText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    infoGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
    infoBox: { flex: 1, backgroundColor: colors.secondary, borderRadius: 10, padding: 12, alignItems: "center" },
    infoNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
    infoLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 3 },
    statsRow: { flexDirection: "row", gap: 8 },
    statBox: { flex: 1, backgroundColor: colors.secondary, borderRadius: 10, padding: 12, alignItems: "center" },
    statNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
    statLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.7, marginTop: 3 },
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
    runSheetContainer: { paddingHorizontal: 16, paddingBottom: 12 },
    runSheetItem: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 4 },
    runSheetLine: { width: 2, flex: 1, position: "absolute", left: 57, top: 0, bottom: 0 },
    timeCol: { width: 48, alignItems: "flex-end", paddingTop: 10 },
    timeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    iconCol: { width: 28, alignItems: "center", paddingTop: 8, zIndex: 1 },
    iconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    taskCard: { flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, marginBottom: 8 },
    taskCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
    categoryLabel: { fontSize: 9, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8 },
    taskText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
    taskTextDone: { textDecorationLine: "line-through", opacity: 0.5 },
    checkBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 8 },
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
    memberAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
    memberAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
    memberName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    memberRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    memberNum: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 1 },
    memberShift: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
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
        <View style={s.toolbarSpacer} />
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
          <View style={[s.typePill, { backgroundColor: tc + "20", borderColor: tc + "60" }]}>
            <Text style={[s.typeText, { color: tc }]}>{editing ? draft.functionType : fn.functionType}</Text>
          </View>
          <Text style={s.eventName}>{editing ? draft.name || fn.name : fn.name}</Text>
          <View style={s.roomRow}>
            <MaterialCommunityIcons name="door" size={16} color={colors.mutedForeground} />
            <Text style={s.roomLabel}>Room</Text>
            <Text style={s.roomValue}>{editing ? draft.room || fn.room : fn.room}</Text>
            <View style={s.floorTag}>
              <Text style={s.floorTagText}>{editing ? draft.floor || fn.floor : fn.floor}</Text>
            </View>
          </View>
          <View style={s.infoGrid}>
            <View style={s.infoBox}>
              <Text style={[s.infoNum, { color: colors.foreground }]}>{editing ? draft.guestCount : fn.guestCount}</Text>
              <Text style={s.infoLabel}>Guests</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={[s.infoNum, { color: colors.info }]}>{editing ? draft.startTime : fn.startTime}</Text>
              <Text style={s.infoLabel}>Start</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={[s.infoNum, { color: colors.mutedForeground }]}>{editing ? draft.endTime : fn.endTime}</Text>
              <Text style={s.infoLabel}>Finish</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: prepDone === fnPrep.length && fnPrep.length > 0 ? colors.accent : colors.warning }]}>{prepDone}/{fnPrep.length}</Text>
              <Text style={s.statLabel}>Food ready</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: stepsDone === fn.timeline.length && fn.timeline.length > 0 ? colors.accent : colors.primary }]}>{stepsDone}/{fn.timeline.length}</Text>
              <Text style={s.statLabel}>Tasks done</Text>
            </View>
            <View style={[s.statBox, totalDietary > 0 && hasSevereAllergen && { backgroundColor: "#F59E0B15" }]}>
              <Text style={[s.statNum, { color: hasSevereAllergen ? "#F59E0B" : totalDietary > 0 ? colors.info : colors.foreground }]}>{totalDietary}</Text>
              <Text style={s.statLabel}>Dietary</Text>
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
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{currentMember?.role}</Text>
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

            {/* Course fire times */}
            <View style={[s.editCard, { borderColor: tc + "60", marginTop: 10 }]}>
              <View style={[s.editCardHeader, { backgroundColor: tc + "15", borderBottomColor: tc + "30" }]}>
                <Feather name="clock" size={14} color={tc} />
                <Text style={[s.editCardTitle, { color: tc }]}>Course / Service Times</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>HH:MM — leave blank to hide</Text>
              </View>
              {courseOrder.map((c) => (
                <View key={c.key} style={s.courseEditRow}>
                  <Text style={[s.courseEditLabel, { color: tc }]}>{c.label}</Text>
                  <TextInput style={[s.courseEditInput, { color: tc }]} value={draft[c.draftKey] as string} onChangeText={(v) => updateDraft(c.draftKey, v)} placeholder="--:--" placeholderTextColor={colors.mutedForeground} />
                </View>
              ))}
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
            {/* Course fire times */}
            {activeCourses.length > 0 && (
              <View style={[s.courseCard, { backgroundColor: tc + "12", borderColor: tc + "40" }]}>
                <View style={[s.courseCardHeader, { borderBottomColor: tc + "30" }]}>
                  <Feather name="clock" size={14} color={tc} />
                  <Text style={[s.courseCardTitle, { color: tc }]}>Course / Service Times — {fn.functionType}</Text>
                </View>
                <View style={s.courseRow}>
                  {activeCourses.map((c, idx) => (
                    <View key={c.key} style={[s.courseBox, { borderRightColor: tc + "25" }, idx === activeCourses.length - 1 && { borderRightWidth: 0 }]}>
                      <Text style={[s.courseLabel, { color: tc + "AA" }]}>{c.label}</Text>
                      <Text style={[s.courseTime, { color: tc }]}>{fn.serviceTimes![c.key]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Dietary Requirements ─────────────────────────────────────── */}
            {dietaryReqs.length > 0 && (
              <View style={[s.dietaryCard, { borderColor: hasSevereAllergen ? "#F59E0B80" : colors.border }]}>
                <View style={[s.dietaryHeader, { borderBottomColor: hasSevereAllergen ? "#F59E0B30" : colors.border, backgroundColor: hasSevereAllergen ? "#F59E0B10" : colors.card }]}>
                  <Ionicons name="warning" size={16} color={hasSevereAllergen ? "#F59E0B" : colors.mutedForeground} />
                  <Text style={[s.dietaryTitle, { color: hasSevereAllergen ? "#F59E0B" : colors.foreground }]}>Dietary Requirements</Text>
                  <View style={[s.dietaryTotalBadge, { backgroundColor: hasSevereAllergen ? "#F59E0B" : colors.info }]}>
                    <Text style={s.dietaryTotalText}>{totalDietary} guests</Text>
                  </View>
                </View>

                {hasSevereAllergen && (
                  <View style={[s.severeWarning, { backgroundColor: "#EF444410", borderBottomColor: "#EF444430" }]}>
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text style={[s.severeText, { color: "#EF4444" }]}>Severe allergen on this function — check notes before service. Epinephrine on site.</Text>
                  </View>
                )}

                <View style={s.dietaryList}>
                  {dietaryReqs.map((req, idx) => {
                    const dc = getDietaryColor(req.name);
                    const isExpanded = expandedDietary === req.name + idx;
                    const isSevere = req.name.toLowerCase().includes("nut") || req.name.toLowerCase().includes("shellfish");
                    return (
                      <View key={idx} style={[s.dietaryRow, { backgroundColor: dc + "12", borderColor: dc + "40" }]}>
                        <View style={s.dietaryBadgeRow}>
                          <View style={[s.dietaryCount, { backgroundColor: dc + "25" }]}>
                            <Text style={[s.dietaryCountText, { color: dc }]}>{req.count}</Text>
                          </View>
                          <Text style={[s.dietaryName, { color: colors.foreground }]}>
                            {req.name}
                            {isSevere ? " ⚠" : ""}
                          </Text>
                          {req.note ? (
                            <Pressable
                              style={[s.dietaryNoteToggle, { backgroundColor: dc + "25" }]}
                              onPress={() => setExpandedDietary(isExpanded ? null : req.name + idx)}
                            >
                              <Text style={[s.dietaryNoteToggleText, { color: dc }]}>{isExpanded ? "Hide" : "Notes"}</Text>
                            </Pressable>
                          ) : null}
                        </View>
                        {isExpanded && req.note ? (
                          <View style={s.dietaryNote}>
                            <Text style={[s.dietaryNoteText, { color: colors.mutedForeground }]}>{req.note}</Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Service Run Sheet ────────────────────────────────────────── */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Service Run Sheet</Text>
              <Text style={s.sectionSub}>Tap the box on each task to mark it done</Text>
            </View>

            <View style={s.runSheetContainer}>
              {fn.timeline.map((item, idx) => {
                const cat = getCategoryStyle(item.category ?? "setup");
                const isProminentService = cat.prominent;
                const cardBg = isProminentService ? cat.color + "18" : colors.card;
                const cardBorder = isProminentService ? cat.color + "50" : colors.border;

                return (
                  <View key={item.id} style={s.runSheetItem}>
                    {/* Time */}
                    <View style={s.timeCol}>
                      <Text style={[s.timeText, { color: cat.color, fontSize: isProminentService ? 13 : 11 }]}>{item.time}</Text>
                    </View>
                    {/* Icon */}
                    <View style={s.iconCol}>
                      <View style={[s.iconCircle, { backgroundColor: cat.color + "25" }]}>
                        <Feather name={cat.icon} size={12} color={cat.color} />
                      </View>
                    </View>
                    {/* Task card */}
                    <View style={[s.taskCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                      <View style={s.taskCardHeader}>
                        <Text style={[s.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
                        {isProminentService && (
                          <View style={{ paddingHorizontal: 5, paddingVertical: 2, backgroundColor: cat.color + "25", borderRadius: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: cat.color }}>KEY EVENT</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }} />
                        <Pressable
                          style={({ pressed }) => [s.checkBtn, { backgroundColor: item.completed ? colors.accent : "transparent", borderColor: item.completed ? colors.accent : colors.border, opacity: pressed ? 0.7 : 1 }]}
                          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTimelineItem(fn.id, item.id); }}
                        >
                          {item.completed && <Feather name="check" size={14} color="#fff" />}
                        </Pressable>
                      </View>
                      <Text style={[s.taskText, item.completed && s.taskTextDone, { color: item.completed ? colors.mutedForeground : colors.foreground }]}>
                        {item.task}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={s.div} />

            {/* ── Function Menu ─────────────────────────────────────────── */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Function Menu</Text>
              {fn.menu.map((line, i) => {
                const { course, name, desc, tags } = parseMenuLine(line);
                return (
                  <View key={i} style={s.menuItem}>
                    {course ? <Text style={[s.menuCourse, { color: tc }]}>{course}</Text> : null}
                    <Text style={s.menuDishName}>{name}</Text>
                    {desc ? <Text style={s.menuDishDesc}>{desc}</Text> : null}
                    {tags.length > 0 && (
                      <View style={s.menuTagRow}>
                        {tags.map((tag, ti) => {
                          const tagColor = getDietaryColor(tag);
                          return (
                            <View key={ti} style={[s.menuTag, { backgroundColor: tagColor + "20" }]}>
                              <Text style={[s.menuTagText, { color: tagColor }]}>{tag}</Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={s.div} />

            {/* ── Staff ───────────────────────────────────────────────────── */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Staff Working This Event</Text>
              <Text style={s.sectionSub}>{fnStaff.length} people on this team</Text>
              {fnStaff.map((member) => {
                const rc = getRoleColor(member.role);
                return (
                  <View key={member.id} style={s.memberRow}>
                    <View style={[s.memberAvatar, { backgroundColor: rc + "25" }]}>
                      <Text style={[s.memberAvatarText, { color: rc }]}>{member.name.split(" ").map((n) => n[0]).join("")}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.memberName}>{member.name}</Text>
                      <Text style={[s.memberRole, { color: rc }]}>{member.role}</Text>
                      <Text style={s.memberNum}>{member.staffNumber}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Shift</Text>
                      <Text style={s.memberShift}>{member.shiftStart}–{member.shiftEnd}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
