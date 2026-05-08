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
import { FunctionType, MANAGER_ROLES, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

const FUNCTION_TYPES: FunctionType[] = [
  "A-la-carte", "Set Menu", "Buffet", "Cocktail", "Canapés", "Canapés + A-la-carte", "School Ball", "High Tea",
];

function getFunctionTypeColor(type: FunctionType): string {
  switch (type) {
    case "A-la-carte": return "#F59E0B";
    case "Buffet": return "#3B82F6";
    case "Cocktail": return "#8B5CF6";
    case "Canapés": return "#22C55E";
    case "Canapés + A-la-carte": return "#F97316";
    case "School Ball": return "#EC4899";
    case "Set Menu": return "#14B8A6";
    case "High Tea": return "#F43F5E";
    default: return "#6B7A94";
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

  useEffect(() => {
    if (fn && !draft) {
      setDraft({
        name: fn.name,
        room: fn.room,
        floor: fn.floor,
        functionType: fn.functionType,
        startTime: fn.startTime,
        endTime: fn.endTime,
        guestCount: String(fn.guestCount),
        entree: fn.serviceTimes?.entree ?? "",
        main: fn.serviceTimes?.main ?? "",
        dessert: fn.serviceTimes?.dessert ?? "",
        amuse: fn.serviceTimes?.amuse ?? "",
        supper: fn.serviceTimes?.supper ?? "",
      });
    }
  }, [fn]);

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
  const isAlaCarte = fn.functionType === "A-la-carte" || fn.functionType === "Canapés + A-la-carte";
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const timeChanged =
    fn.startTime !== draft.startTime ||
    fn.endTime !== draft.endTime ||
    (fn.serviceTimes?.entree ?? "") !== draft.entree ||
    (fn.serviceTimes?.main ?? "") !== draft.main;

  function updateDraft(field: keyof DraftFunction, value: string) {
    setDraft((d) => d ? { ...d, [field]: value } : d);
    setHasUnsaved(true);
  }

  function handleSave() {
    if (!draft) return;
    const guestNum = parseInt(draft.guestCount, 10);
    if (isNaN(guestNum) || guestNum < 1) {
      Alert.alert("Invalid guest count", "Please enter a valid number of guests.");
      return;
    }
    updateFunction(fn.id, {
      name: draft.name.trim() || fn.name,
      room: draft.room.trim() || fn.room,
      floor: draft.floor.trim() || fn.floor,
      functionType: draft.functionType,
      startTime: draft.startTime.trim() || fn.startTime,
      endTime: draft.endTime.trim() || fn.endTime,
      guestCount: guestNum,
      serviceTimes: {
        amuse: draft.amuse || undefined,
        entree: draft.entree || undefined,
        main: draft.main || undefined,
        dessert: draft.dessert || undefined,
        supper: draft.supper || undefined,
      },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
    setHasUnsaved(false);
    Alert.alert("Saved", "Function details updated. All team members will see the changes.", [{ text: "OK" }]);
  }

  function handleCancelEdit() {
    if (hasUnsaved) {
      Alert.alert("Discard changes?", "You have unsaved changes.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => { setDraft({ name: fn.name, room: fn.room, floor: fn.floor, functionType: fn.functionType, startTime: fn.startTime, endTime: fn.endTime, guestCount: String(fn.guestCount), entree: fn.serviceTimes?.entree ?? "", main: fn.serviceTimes?.main ?? "", dessert: fn.serviceTimes?.dessert ?? "", amuse: fn.serviceTimes?.amuse ?? "", supper: fn.serviceTimes?.supper ?? "" }); setEditing(false); setHasUnsaved(false); } },
      ]);
    } else {
      setEditing(false);
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case "Head Chef": return colors.primary;
      case "Sous Chef": return colors.info;
      case "Pastry Chef": return "#A78BFA";
      case "Function Captain": return "#3B82F6";
      case "Casual": return colors.warning;
      default: return colors.mutedForeground;
    }
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    toolbar: { position: "absolute", top: topPad + 8, left: 0, right: 0, zIndex: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    toolbarSpacer: { flex: 1 },
    editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    editBtnText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.accent },
    saveBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    cancelBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
    cancelBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    timeChangedBanner: { marginHorizontal: 20, marginTop: 8, padding: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F59E0B20", borderWidth: 1, borderColor: "#F59E0B60" },
    timeChangedText: { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#F59E0B" },
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
    courseCard: { marginHorizontal: 20, marginTop: 18, backgroundColor: tc + "12", borderRadius: colors.radius, borderWidth: 1.5, borderColor: tc + "40", overflow: "hidden" },
    courseCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc + "30" },
    courseCardTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: tc },
    courseRow: { flexDirection: "row" },
    courseBox: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: tc + "25" },
    courseLabel: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
    courseTime: { fontSize: 20, fontFamily: "Inter_700Bold" },
    section: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 4 },
    sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 14 },
    div: { height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginTop: 16 },
    taskRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 13, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    taskTime: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary, width: 52, paddingTop: 2 },
    taskText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 22 },
    checkBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    menuItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border },
    menuCourse: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.6, width: 58, paddingTop: 3 },
    menuDish: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 21 },
    memberRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    memberAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
    memberAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
    memberName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    memberRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    memberNumLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    memberShiftTime: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 1 },
    // Edit mode styles
    editSection: { marginHorizontal: 20, marginTop: 18, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1.5, borderColor: colors.primary + "60", overflow: "hidden" },
    editSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.primary + "15", borderBottomWidth: 1, borderBottomColor: colors.primary + "30" },
    editSectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary, flex: 1 },
    fieldRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 50 },
    fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, width: 80 },
    fieldInput: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 10 },
    typeSelectRow: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    typeSelectLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 },
    typeChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    typeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
    typeChipText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    courseEditRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 46 },
    courseEditLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: tc, width: 72 },
    courseEditInput: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold", color: tc, paddingVertical: 8 },
    editHint: { paddingHorizontal: 14, paddingVertical: 10 },
    editHintText: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 40 },
  });

  const courseOrder: Array<{ key: keyof typeof fn.serviceTimes; label: string; draftKey: keyof DraftFunction }> = [
    { key: "amuse", label: "Amuse", draftKey: "amuse" },
    { key: "entree", label: "Entrée", draftKey: "entree" },
    { key: "main", label: "Main", draftKey: "main" },
    { key: "dessert", label: "Dessert", draftKey: "dessert" },
    { key: "supper", label: "Supper", draftKey: "supper" },
  ];
  const activeCourses = fn.serviceTimes
    ? courseOrder.filter((c) => fn.serviceTimes![c.key])
    : [];

  function parseMenuCourse(item: string): { course: string; dish: string } {
    const colonIdx = item.indexOf(":");
    if (colonIdx > -1) return { course: item.slice(0, colonIdx).trim(), dish: item.slice(colonIdx + 1).trim() };
    return { course: "", dish: item };
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Toolbar */}
      <View style={s.toolbar}>
        <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={() => { if (editing && hasUnsaved) { handleCancelEdit(); } else { router.back(); } }}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={s.toolbarSpacer} />
        {canEdit && !editing && (
          <Pressable style={({ pressed }) => [s.editBtn, { backgroundColor: colors.card, borderColor: colors.primary + "60", opacity: pressed ? 0.7 : 1 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEditing(true); }}>
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
        {/* Hero */}
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
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: colors.foreground }]}>{fnStaff.length}</Text>
              <Text style={s.statLabel}>Staff</Text>
            </View>
          </View>
        </View>

        {/* Time changed banner */}
        {!editing && timeChanged && (
          <View style={s.timeChangedBanner}>
            <Ionicons name="time" size={16} color="#F59E0B" />
            <Text style={s.timeChangedText}>Times have been updated — check course fire times below</Text>
          </View>
        )}

        {/* ── EDIT MODE PANELS ────────────────────────────────────────────── */}
        {editing && (
          <>
            {/* Function details */}
            <View style={s.editSection}>
              <View style={s.editSectionHeader}>
                <Feather name="edit-2" size={14} color={colors.primary} />
                <Text style={s.editSectionTitle}>Function Details</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                  {currentMember?.role}
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
                <Text style={s.fieldLabel}>Start</Text>
                <TextInput style={s.fieldInput} value={draft.startTime} onChangeText={(v) => updateDraft("startTime", v)} placeholder="HH:MM" placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Finish</Text>
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
            <View style={[s.editSection, { marginTop: 12 }]}>
              <View style={s.editSectionHeader}>
                <Feather name="clock" size={14} color={tc} />
                <Text style={[s.editSectionTitle, { color: tc }]}>Course Fire Times</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>HH:MM format</Text>
              </View>
              {courseOrder.map((c) => (
                <View key={c.key} style={s.courseEditRow}>
                  <Text style={s.courseEditLabel}>{c.label}</Text>
                  <TextInput
                    style={s.courseEditInput}
                    value={draft[c.draftKey] as string}
                    onChangeText={(v) => updateDraft(c.draftKey, v)}
                    placeholder="--:--"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              ))}
              <View style={s.editHint}>
                <Text style={s.editHintText}>Leave blank to hide that course. Changes are visible to all team members immediately after saving.</Text>
              </View>
            </View>
          </>
        )}

        {/* ── VIEW MODE ────────────────────────────────────────────────────── */}
        {!editing && (
          <>
            {isAlaCarte && activeCourses.length > 0 && (
              <View style={s.courseCard}>
                <View style={s.courseCardHeader}>
                  <Feather name="clock" size={14} color={tc} />
                  <Text style={s.courseCardTitle}>Course Fire Times — {fn.functionType}</Text>
                </View>
                <View style={s.courseRow}>
                  {activeCourses.map((c, idx) => (
                    <View key={c.key} style={[s.courseBox, idx === activeCourses.length - 1 && { borderRightWidth: 0 }]}>
                      <Text style={[s.courseLabel, { color: tc + "AA" }]}>{c.label}</Text>
                      <Text style={[s.courseTime, { color: tc }]}>{fn.serviceTimes![c.key]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={s.section}>
              <Text style={s.sectionTitle}>Work Plan</Text>
              <Text style={s.sectionSub}>Tap the box to mark each task done</Text>
              {fn.timeline.map((item) => (
                <View key={item.id} style={s.taskRow}>
                  <Text style={s.taskTime}>{item.time}</Text>
                  <Text style={[s.taskText, { color: item.completed ? colors.mutedForeground : colors.foreground, textDecorationLine: item.completed ? "line-through" : "none" }]}>
                    {item.task}
                  </Text>
                  <Pressable
                    style={({ pressed }) => [s.checkBtn, { backgroundColor: item.completed ? colors.accent : "transparent", borderColor: item.completed ? colors.accent : colors.border, opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTimelineItem(fn.id, item.id); }}
                  >
                    {item.completed && <Feather name="check" size={18} color="#fff" />}
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={s.div} />

            <View style={s.section}>
              <Text style={s.sectionTitle}>What's Being Served</Text>
              <Text style={s.sectionSub}>{fn.menu.length} courses</Text>
              {fn.menu.map((item, i) => {
                const { course, dish } = parseMenuCourse(item);
                return (
                  <View key={i} style={s.menuItem}>
                    {course ? <Text style={[s.menuCourse, { color: tc }]}>{course}</Text> : <Feather name="circle" size={6} color={colors.primary} style={{ marginTop: 6, marginRight: 4 }} />}
                    <Text style={s.menuDish}>{dish}</Text>
                  </View>
                );
              })}
            </View>

            <View style={s.div} />

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
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.memberNumLabel}>{member.staffNumber}</Text>
                      <Text style={s.memberShiftTime}>{member.shiftStart}–{member.shiftEnd}</Text>
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
