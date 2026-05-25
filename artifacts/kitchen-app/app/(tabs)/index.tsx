import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BroadcastMessage, FunctionType, PrepTeam, getAccessLevel, useKitchen } from "@/context/KitchenContext";
import { useAlerts, type KitchenAlert, type AlertCategory } from "@/hooks/useAlerts";
import { useColors } from "@/hooks/useColors";
import { useIsTablet } from "@/hooks/useIsTablet";
import { LinearGradient } from "expo-linear-gradient";
import { PrepFlowsLogo } from "@/components/PrepFlowsLogo";
import { GlassCard } from "@/components/GlassCard";

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getRoleColor(role: string, colors: ReturnType<typeof useColors>) {
  switch (role) {
    case "Head Chef": return colors.primary;
    case "Sous Chef": return colors.info;
    case "Pastry Chef": return "#A78BFA";
    case "Casual": return colors.warning;
    default: return colors.mutedForeground;
  }
}

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

function getMealCategory(startTime: string): { label: string; color: string } {
  const mins = timeToMinutes(startTime);
  if (mins < 10 * 60 + 30) return { label: "Breakfast",      color: "#F97316" };
  if (mins < 12 * 60)      return { label: "Morning Tea",    color: "#F59E0B" };
  if (mins < 15 * 60)      return { label: "Lunch",          color: "#22C55E" };
  if (mins < 17 * 60)      return { label: "Afternoon Tea",  color: "#A78BFA" };
  return                          { label: "Dinner",          color: "#3B82F6" };
}

function abbreviateType(type: FunctionType): string {
  switch (type) {
    case "A-la-carte":           return "À La Carte";
    case "Canapés + A-la-carte": return "Canapés+ALC";
    case "School Ball":          return "School Ball";
    default:                     return type;
  }
}

function formatRelativeTime(isoString: string): string {
  const sent = new Date(isoString);
  const diffMin = Math.floor((Date.now() - sent.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  return diffH < 24 ? `${diffH}h ago` : sent.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

const AMBER = "#F59E0B";

function getTeamColor(team: PrepTeam): string {
  switch (team) {
    case "Hot Kitchen":   return "#F97316";
    case "Cold Larder":   return "#3B82F6";
    case "Pastry":        return "#8B5CF6";
    case "Function Team": return "#22C55E";
    case "Butchery":      return "#EF4444";
    default:              return "#6B7A94";
  }
}

const TEAMS: PrepTeam[] = ["Hot Kitchen", "Cold Larder", "Pastry", "Function Team", "Butchery"];

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isTablet = useIsTablet();
  const {
    functions, prepItems, staff, todayDate,
    currentStaffId, notificationsEnabled,
    broadcastMessage, dismissedBroadcastId,
    setBroadcast, clearBroadcast, dismissBroadcast, sickStaffIds,
  } = useKitchen();

  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTicker((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const isManager = currentMember ? getAccessLevel(currentMember) === "manager" : false;
  const myFunctions = currentMember ? functions.filter((f) => currentMember.functionIds.includes(f.id)) : [];

  const sortedFunctions = [...functions]
    .filter((f) => timeToMinutes(f.endTime) > nowMinutes)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const nextFn = sortedFunctions.find((f) => timeToMinutes(f.startTime) > nowMinutes)
    ?? sortedFunctions.find((f) => timeToMinutes(f.endTime) > nowMinutes)
    ?? null;
  const nextFnMins = nextFn ? timeToMinutes(nextFn.startTime) - nowMinutes : null;
  const sickCount = sickStaffIds.length;
  const { alerts, criticalCount, warningCount, infoCount, alertsByFunctionId, dismissAlert, dismissAll } = useAlerts();

  const totalPrep = prepItems.length;
  const completedPrep = prepItems.filter((p) => p.completed).length;
  const prepPercent = totalPrep > 0 ? completedPrep / totalPrep : 0;

  const showBroadcast = broadcastMessage !== null && broadcastMessage.id !== dismissedBroadcastId;
  const [composeVisible, setComposeVisible] = useState(false);
  const [draftText, setDraftText] = useState("");
  const inputRef = useRef<TextInput>(null);

  function openCompose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDraftText("");
    setComposeVisible(true);
  }

  function sendBroadcast() {
    const trimmed = draftText.trim();
    if (!trimmed || !currentMember) return;
    const msg: BroadcastMessage = {
      id: Date.now().toString(),
      text: trimmed,
      senderName: currentMember.name,
      senderRole: currentMember.role,
      sentAt: new Date().toISOString(),
    };
    setBroadcast(msg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setComposeVisible(false);
    setDraftText("");
  }

  function handleClearBroadcast() {
    Alert.alert("Remove alert?", "This will remove the message for all staff.", [
      { text: "Keep it", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => { clearBroadcast(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
    ]);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    header: { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "flex-end" },
    headerLeft: { flex: 1 },
    dateLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" },
    headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2 },
    megaBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 4, borderWidth: 1 },
    broadcastBanner: { marginHorizontal: 20, marginBottom: 14, borderRadius: colors.radius, borderWidth: 1.5, overflow: "hidden" },
    broadcastTop: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 10 },
    broadcastIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 1 },
    broadcastBody: { flex: 1 },
    broadcastLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 4 },
    broadcastText: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 21, color: colors.foreground },
    broadcastMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 5, color: colors.mutedForeground },
    broadcastActions: { flexDirection: "row", borderTopWidth: 1 },
    broadcastBtn: { flex: 1, paddingVertical: 11, alignItems: "center" },
    broadcastBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    countdownCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: colors.radius, borderWidth: 1, overflow: "hidden" },
    countdownHeader: { paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6, borderBottomWidth: 1 },
    countdownHeaderText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.2, textTransform: "uppercase" },
    countdownBody: { padding: 16, paddingLeft: 19 },
    countdownAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
    countdownMinRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 2 },
    countdownNum: { fontSize: 52, fontFamily: "Inter_700Bold", lineHeight: 56 },
    countdownUnit: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
    countdownName: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    countdownMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 3 },
    myCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: colors.radius, borderWidth: 1, overflow: "hidden" },
    myCardHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
    myAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    myAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
    myName: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    myRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    notifPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    notifPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    myDivider: { height: 1 },
    myEvents: { padding: 12, gap: 8 },
    myEventRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    myEventTime: { fontSize: 13, fontFamily: "Inter_700Bold" },
    myEventName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    myEventSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#484F58", letterSpacing: 1.2, textTransform: "uppercase", marginHorizontal: 20, marginBottom: 12 },
    fnCard: { marginHorizontal: 20, marginBottom: 10, backgroundColor: "#161B22", borderRadius: colors.radius, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
    fnCardTop: { flexDirection: "row", alignItems: "stretch" },
    fnTimeBadge: { width: 72, alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 6, borderRightWidth: 1 },
    fnTimeBadgeNum: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5, marginBottom: 2 },
    fnTimeBadgeText: { fontSize: 16, fontFamily: "Inter_700Bold" },
    fnTimeBadgeEnd: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 1 },
    fnTimeBadgeType: { fontSize: 9, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 4, textAlign: "center" },
    fnBody: { flex: 1, padding: 12 },
    fnName: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 },
    fnMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 },
    fnTypePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    fnTypeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    fnMetaChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: colors.secondary, borderRadius: 5 },
    fnMetaChipText: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    fnPaxBig: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground },
    fnSectionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    fnSectionLabel: { fontSize: 10, fontFamily: "Inter_700Bold", width: 76, textTransform: "uppercase", letterSpacing: 0.4 },
    fnSectionBar: { flex: 1, height: 6, borderRadius: 4, backgroundColor: "#21262D", overflow: "hidden" },
    fnSectionFill: { height: 6, borderRadius: 4 },
    fnSectionPct: { fontSize: 10, fontFamily: "Inter_700Bold", width: 30, textAlign: "right" },
    fnAlertRow: { flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingBottom: 10, flexWrap: "wrap" },
    fnAlertBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    fnAlertText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    fnCardLeftBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
    liveBadge: { backgroundColor: "rgba(234,179,8,0.1)", borderColor: "rgba(234,179,8,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 6 },
    liveBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#EAB308" },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    statusBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 24, borderTopWidth: 1, borderColor: colors.border },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginTop: 12, marginBottom: 4 },
    sheetHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    sheetTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    sheetSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
    inputWrap: { margin: 16, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 100 },
    textInput: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22 },
    charCount: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right", marginRight: 16, marginTop: -8, marginBottom: 8 },
    sendBtn: { marginHorizontal: 16, marginTop: 4, borderRadius: 12, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
    sendBtnText: { fontSize: 15, fontFamily: "Inter_700Bold" },
    tipRow: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, marginTop: 12 },
    tipText: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, flex: 1 },
  });

  // ── Shared card renderers ──────────────────────────────────
  function renderCountdown() {
    if (!nextFn || nextFnMins === null) return null;
    const urgentColor = nextFnMins <= 30 ? "#EF4444" : nextFnMins <= 60 ? AMBER : colors.primary;
    const cardBorderColor = "rgba(249, 115, 22, 0.3)";
    return (
      <GlassCard style={s.countdownCard} accentColor={urgentColor}>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${nextFn.id}`); }}
      >
        <LinearGradient colors={["#3B82F6", "#06B6D4", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.countdownAccent} />
        <View style={[s.countdownHeader, { borderBottomColor: urgentColor + "30", backgroundColor: urgentColor + "12" }]}>
          <Ionicons name="timer-outline" size={14} color={urgentColor} />
          <Text style={[s.countdownHeaderText, { color: urgentColor }]}>{nextFnMins <= 0 ? "NOW" : "Next Event"}</Text>
          {sickCount > 0 && (
            <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#EF444420", borderRadius: 6 }}>
              <Ionicons name="alert-circle" size={12} color="#EF4444" />
              <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#EF4444" }}>{sickCount} sick today</Text>
            </View>
          )}
        </View>
        <View style={s.countdownBody}>
          <View style={s.countdownMinRow}>
            <Text style={[s.countdownNum, { color: urgentColor }]}>
              {nextFnMins <= 0 ? "NOW" : nextFnMins >= 60 ? `${Math.floor(nextFnMins / 60)}h ${nextFnMins % 60}m` : nextFnMins}
            </Text>
            {nextFnMins > 0 && nextFnMins < 60 && (
              <Text style={[s.countdownUnit, { color: urgentColor }]}>min</Text>
            )}
          </View>
          <Text style={s.countdownName} numberOfLines={1}>{nextFn.name}</Text>
          <Text style={s.countdownMeta}>{nextFn.room} · {nextFn.floor} · {nextFn.guestCount} guests · {nextFn.startTime}–{nextFn.endTime}</Text>
        </View>
      </Pressable>
      </GlassCard>
    );
  }

  function renderMyShift() {
    if (!currentMember) return null;
    const rc = getRoleColor(currentMember.role, colors);
    return (
      <GlassCard style={s.myCard} accentColor={rc}>
        <View style={s.myCardHeader}>
          <View style={[s.myAvatar, { backgroundColor: rc + "30" }]}>
            <Text style={[s.myAvatarText, { color: rc }]}>{currentMember.name.split(" ").map((n) => n[0]).join("")}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.myName}>{currentMember.name}</Text>
            <Text style={[s.myRole, { color: rc }]}>{currentMember.role} · Shift {currentMember.shiftStart}–{currentMember.shiftEnd}</Text>
          </View>
          <View style={[s.notifPill, { backgroundColor: notificationsEnabled ? colors.accent + "20" : colors.secondary }]}>
            <Ionicons name={notificationsEnabled ? "notifications" : "notifications-off"} size={12} color={notificationsEnabled ? colors.accent : colors.mutedForeground} />
            <Text style={[s.notifPillText, { color: notificationsEnabled ? colors.accent : colors.mutedForeground }]}>
              {notificationsEnabled ? "On" : "Off"}
            </Text>
          </View>
        </View>
        {myFunctions.length > 0 && (
          <>
            <View style={[s.myDivider, { backgroundColor: rc + "30" }]} />
            <View style={s.myEvents}>
              {myFunctions.map((fn) => {
                const tc = getFunctionTypeColor(fn.functionType);
                return (
                  <Pressable key={fn.id} style={({ pressed }) => [s.myEventRow, { backgroundColor: rc + "12", borderColor: rc + "30" }, pressed && { opacity: 0.8 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}>
                    <Text style={[s.myEventTime, { color: rc }]}>{fn.startTime}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.myEventName} numberOfLines={1}>{fn.name}</Text>
                      <Text style={s.myEventSub}>{fn.room} · {fn.guestCount} guests</Text>
                    </View>
                    <View style={[s.fnTypePill, { backgroundColor: tc + "22" }]}>
                      <Text style={[s.fnTypeText, { color: tc }]}>{fn.functionType}</Text>
                    </View>
                    <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </GlassCard>
    );
  }

  function renderFunctionList() {
    const activeFnsCount = sortedFunctions.filter(fn => {
      const fnMins = timeToMinutes(fn.startTime) - nowMinutes;
      return fnMins <= 0 && timeToMinutes(fn.endTime) > nowMinutes;
    }).length;

    return (
      <>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 12 }}>
          <Text style={[s.sectionLabel, { marginHorizontal: 0, marginBottom: 0 }]}>Today's Functions</Text>
          {activeFnsCount > 0 && (
            <View style={s.liveBadge}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#EAB308" }} />
              <Text style={s.liveBadgeText}>{activeFnsCount} LIVE</Text>
            </View>
          )}
        </View>
        {sortedFunctions.length === 0 && (
          <View style={{ marginHorizontal: 20, padding: 24, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 8 }}>
            <Feather name="calendar" size={28} color={colors.mutedForeground} />
            <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>No functions today</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" }}>Add functions from the Functions tab</Text>
          </View>
        )}
        {isManager ? (
          sortedFunctions.map((fn, idx) => {
            const tc = getFunctionTypeColor(fn.functionType);
            const meal = getMealCategory(fn.startTime);
            const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
            const isNextEvent = nextFn?.id === fn.id;
            const teamProgress = TEAMS.map((team) => {
              const teamItems = fnPrep.filter((p) => p.team === team);
              if (teamItems.length === 0) return null;
              const done = teamItems.filter((p) => p.completed).length;
              return { team, done, total: teamItems.length, pct: done / teamItems.length };
            }).filter(Boolean) as { team: PrepTeam; done: number; total: number; pct: number }[];
            const dietaryReqs = fn.dietaryRequirements ?? [];
            const hasSevere = dietaryReqs.some((d) => d.name.toLowerCase().includes("nut") || d.name.toLowerCase().includes("shellfish"));
            const totalDietary = dietaryReqs.reduce((sum, d) => sum + d.count, 0);
            const nextCourse = fn.serviceEvents && fn.serviceEvents.length > 0
              ? fn.serviceEvents.find((e) => timeToMinutes(e.time) > nowMinutes) ?? null
              : fn.serviceTimes
                ? (["amuse", "entree", "main", "dessert", "supper"] as const)
                    .map((k) => fn.serviceTimes![k] ? { time: fn.serviceTimes![k]!, label: k.charAt(0).toUpperCase() + k.slice(1) } : null)
                    .filter(Boolean)
                    .find((c) => timeToMinutes(c!.time) > nowMinutes) ?? null
                : null;
            const fnMins = timeToMinutes(fn.startTime) - nowMinutes;
            const isUrgent = fnMins > 0 && fnMins <= 30;
            const isActive = fnMins <= 0 && timeToMinutes(fn.endTime) > nowMinutes;
            const isDone = timeToMinutes(fn.endTime) <= nowMinutes;
            const statusColor = isActive ? "#EAB308" : isDone ? "#22C55E" : "#3B82F6";
            const statusLabel = isActive ? "In Progress" : isDone ? "Done" : "Upcoming";
            const statusStyle = isActive 
              ? { backgroundColor: "rgba(234,179,8,0.12)", color: "#EAB308", borderColor: "rgba(234,179,8,0.2)" }
              : isDone 
                ? { backgroundColor: "rgba(34,197,94,0.12)", color: "#22C55E", borderColor: "rgba(34,197,94,0.2)" }
                : { backgroundColor: "rgba(59,130,246,0.12)", color: "#3B82F6", borderColor: "rgba(59,130,246,0.2)" };

            const fnAlerts = alertsByFunctionId.get(fn.id) ?? [];
            return (
              <GlassCard key={fn.id} style={s.fnCard} accentColor={statusColor}>
                {statusColor === "#3B82F6"
                  ? <LinearGradient colors={["#3B82F6", "#06B6D4", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.fnCardLeftBar} />
                  : <View style={[s.fnCardLeftBar, { backgroundColor: statusColor }]} />}
                <View style={s.fnCardTop}>
                  <View style={[s.fnTimeBadge, { backgroundColor: statusColor + "10", borderRightColor: "rgba(255,255,255,0.05)" }]}>
                    <Text style={[s.fnTimeBadgeNum, { color: statusColor }]}>#{idx + 1}</Text>
                    <Text style={[s.fnTimeBadgeText, { color: statusColor }]}>{fn.startTime}</Text>
                    <Text style={[s.fnTimeBadgeEnd, { color: statusColor + "90" }]}>{fn.endTime}</Text>
                    <Text style={[s.fnTimeBadgeType, { color: statusColor }]} numberOfLines={2}>{abbreviateType(fn.functionType)}</Text>
                  </View>
                  <View style={s.fnBody}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                      <Text style={[s.fnName, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{fn.name}</Text>
                      <View style={[s.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                        <Text style={[s.statusBadgeText, { color: statusStyle.color }]}>{statusLabel}</Text>
                      </View>
                    </View>
                    <View style={s.fnMetaRow}>
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: meal.color + "20", borderWidth: 1, borderColor: meal.color + "45" }}>
                        <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: meal.color }}>{meal.label}</Text>
                      </View>
                      <View style={s.fnMetaChip}><MaterialCommunityIcons name="door" size={10} color={colors.mutedForeground} /><Text style={s.fnMetaChipText}>{fn.room}</Text></View>
                      <View style={s.fnMetaChip}><Ionicons name="people" size={10} color={colors.mutedForeground} /><Text style={s.fnMetaChipText}>{fn.guestCount} pax</Text></View>
                    </View>
                    {teamProgress.map(({ team, done, total, pct }) => {
                      const tc2 = getTeamColor(team);
                      return (
                        <View key={team} style={s.fnSectionRow}>
                          <Text style={[s.fnSectionLabel, { color: tc2 }]}>{team.replace(" Kitchen", " K.").replace(" Larder", " L.").replace(" Team", " T.")}</Text>
                          <View style={s.fnSectionBar}><View style={[s.fnSectionFill, { width: `${pct * 100}%`, backgroundColor: pct >= 1 ? colors.accent : tc2 }]} /></View>
                          <Text style={[s.fnSectionPct, { color: pct >= 1 ? colors.accent : tc2 }]}>{Math.round(pct * 100)}%</Text>
                        </View>
                      );
                    })}
                    {nextCourse && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <Feather name="clock" size={10} color={statusColor} />
                        <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: statusColor }}>{nextCourse.label}: {nextCourse.time}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {(totalDietary > 0 || hasSevere || fnAlerts.some((a) => a.severity !== "info")) && (
                  <View style={s.fnAlertRow}>
                    {fnAlerts.filter((a) => a.severity !== "info").slice(0, 2).map((a) => {
                      const ac = a.severity === "critical" ? "#EF4444" : "#F59E0B";
                      const OPS_ICONS: Record<AlertCategory, React.ComponentProps<typeof Feather>["name"]> = { dietary: "alert-triangle", overlap: "copy", staffing: "users", timeline: "clock", prep: "check-square" };
                      const OPS_LABELS: Record<AlertCategory, string> = { dietary: "Allergen risk", overlap: "Room conflict", staffing: "Understaffed", timeline: "Timeline late", prep: "Prep behind" };
                      return (
                        <View key={a.id} style={[s.fnAlertBadge, { backgroundColor: ac + "12", borderColor: ac + "40" }]}>
                          <Feather name={OPS_ICONS[a.category]} size={10} color={ac} />
                          <Text style={[s.fnAlertText, { color: ac }]}>{OPS_LABELS[a.category]}</Text>
                        </View>
                      );
                    })}
                    {hasSevere && <View style={[s.fnAlertBadge, { backgroundColor: "#EF444412", borderColor: "#EF444440" }]}><Ionicons name="alert-circle" size={12} color="#EF4444" /><Text style={[s.fnAlertText, { color: "#EF4444" }]}>Severe allergen</Text></View>}
                    {dietaryReqs.slice(0, 3).map((d, i) => {
                      const dc = (() => { const n = d.name.toLowerCase(); if (n.includes("gluten")) return "#22C55E"; if (n.includes("vegan")) return "#84CC16"; if (n.includes("nut")) return "#F59E0B"; if (n.includes("dairy")) return "#60A5FA"; if (n.includes("shellfish")) return "#F97316"; if (n.includes("halal")) return "#14B8A6"; return "#94A3B8"; })();
                      return <View key={i} style={[s.fnAlertBadge, { backgroundColor: dc + "15", borderColor: dc + "40" }]}><Text style={[s.fnAlertText, { color: dc }]}>{d.count}× {d.name}</Text></View>;
                    })}
                    {dietaryReqs.length > 3 && <View style={[s.fnAlertBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}><Text style={[s.fnAlertText, { color: colors.mutedForeground }]}>+{dietaryReqs.length - 3} more</Text></View>}
                  </View>
                )}
              </GlassCard>
            );
          })
        ) : (
          sortedFunctions.map((fn, idx) => {
            const meal = getMealCategory(fn.startTime);
            const isMyFn = myFunctions.some((f) => f.id === fn.id);
            const fnMins = timeToMinutes(fn.startTime) - nowMinutes;
            const isActive = fnMins <= 0 && timeToMinutes(fn.endTime) > nowMinutes;
            const isDone = timeToMinutes(fn.endTime) <= nowMinutes;
            const statusColor = isActive ? "#EAB308" : isDone ? "#22C55E" : "#3B82F6";
            const statusLabel = isActive ? "In Progress" : isDone ? "Done" : "Upcoming";
            const statusStyle = isActive 
              ? { backgroundColor: "rgba(234,179,8,0.12)", color: "#EAB308", borderColor: "rgba(234,179,8,0.2)" }
              : isDone 
                ? { backgroundColor: "rgba(34,197,94,0.12)", color: "#22C55E", borderColor: "rgba(34,197,94,0.2)" }
                : { backgroundColor: "rgba(59,130,246,0.12)", color: "#3B82F6", borderColor: "rgba(59,130,246,0.2)" };

            const dietaryReqs = fn.dietaryRequirements ?? [];
            const hasSevere = dietaryReqs.some((d) => d.name.toLowerCase().includes("nut") || d.name.toLowerCase().includes("shellfish"));
            const fnAlerts = alertsByFunctionId.get(fn.id) ?? [];
            return (
              <GlassCard key={fn.id} style={s.fnCard} accentColor={statusColor}>
                {statusColor === "#3B82F6"
                  ? <LinearGradient colors={["#3B82F6", "#06B6D4", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.fnCardLeftBar} />
                  : <View style={[s.fnCardLeftBar, { backgroundColor: statusColor }]} />}
                <View style={s.fnCardTop}>
                  <View style={[s.fnTimeBadge, { backgroundColor: statusColor + "10", borderRightColor: "rgba(255,255,255,0.05)" }]}>
                    <Text style={[s.fnTimeBadgeNum, { color: statusColor }]}>#{idx + 1}</Text>
                    <Text style={[s.fnTimeBadgeText, { color: statusColor }]}>{fn.startTime}</Text>
                    <Text style={[s.fnTimeBadgeEnd, { color: statusColor + "90" }]}>{fn.endTime}</Text>
                    <Text style={[s.fnTimeBadgeType, { color: statusColor }]} numberOfLines={2}>{abbreviateType(fn.functionType)}</Text>
                  </View>
                  <View style={s.fnBody}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                      <Text style={[s.fnName, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{fn.name}</Text>
                      <View style={[s.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                        <Text style={[s.statusBadgeText, { color: statusStyle.color }]}>{statusLabel}</Text>
                      </View>
                    </View>
                    <View style={s.fnMetaRow}>
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: meal.color + "20", borderWidth: 1, borderColor: meal.color + "45" }}>
                        <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: meal.color }}>{meal.label}</Text>
                      </View>
                      <View style={s.fnMetaChip}><MaterialCommunityIcons name="door" size={10} color={colors.mutedForeground} /><Text style={s.fnMetaChipText}>{fn.room}</Text></View>
                      <View style={s.fnMetaChip}><Ionicons name="layers-outline" size={10} color={colors.mutedForeground} /><Text style={s.fnMetaChipText}>{fn.floor}</Text></View>
                      <View style={s.fnMetaChip}><Ionicons name="people" size={10} color={colors.mutedForeground} /><Text style={s.fnMetaChipText}>{fn.guestCount} pax</Text></View>
                      {isMyFn && <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: statusColor + "22", borderRadius: 5 }}><Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: statusColor }}>Your function</Text></View>}
                    </View>
                    {hasSevere && <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}><Ionicons name="alert-circle" size={11} color="#EF4444" /><Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#EF4444" }}>Severe allergen</Text></View>}
                    {fnAlerts.filter((a) => a.severity !== "info" && a.category !== "dietary").slice(0, 1).map((a) => {
                      const ac = a.severity === "critical" ? "#EF4444" : "#F59E0B";
                      const OPS_LABELS: Record<AlertCategory, string> = { dietary: "Allergen risk", overlap: "Room conflict", staffing: "Understaffed", timeline: "Timeline late", prep: "Prep behind" };
                      return (
                        <View key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <Ionicons name="alert-circle" size={11} color={ac} />
                          <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: ac }}>{OPS_LABELS[a.category]}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </GlassCard>
            );
          })
        )}
      </>
    );
  }

  // ── iPad right column panels ───────────────────────────────
  function renderPrepOverview() {
    const teamStats = TEAMS.map((team) => {
      const items = prepItems.filter((p) => p.team === team);
      if (items.length === 0) return null;
      const done = items.filter((p) => p.completed).length;
      return { team, done, total: items.length, pct: done / items.length };
    }).filter(Boolean) as { team: PrepTeam; done: number; total: number; pct: number }[];

    return (
      <View style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.secondary }}>
          <Feather name="check-square" size={13} color={colors.primary} />
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1, letterSpacing: 0.5 }}>PREP OVERVIEW</Text>
          <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: prepPercent >= 1 ? colors.accent : colors.primary }}>
            {completedPrep}/{totalPrep}
          </Text>
        </View>
        {totalPrep === 0 ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>No prep items yet</Text>
          </View>
        ) : (
          <View style={{ padding: 14 }}>
            {/* Overall bar */}
            <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.border, marginBottom: 12, overflow: "hidden" }}>
              {prepPercent >= 1
                ? <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.accent, width: "100%" }} />
                : <LinearGradient colors={["#3B82F6", "#06B6D4", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 8, borderRadius: 4, width: `${prepPercent * 100}%` }} />
              }
            </View>
            {teamStats.map(({ team, done, total, pct }) => {
              const tc = getTeamColor(team);
              return (
                <View key={team} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tc }} />
                  <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, flex: 1 }} numberOfLines={1}>
                    {team.replace(" Kitchen", "").replace(" Larder", "").replace(" Team", "")}
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: pct >= 1 ? colors.accent : tc }}>{done}/{total}</Text>
                  <View style={{ width: 60, height: 6, borderRadius: 4, backgroundColor: "#21262D", overflow: "hidden" }}>
                    {pct >= 1
                      ? <View style={{ height: 6, borderRadius: 4, backgroundColor: colors.accent, width: "100%" }} />
                      : <LinearGradient colors={["#3B82F6", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, borderRadius: 4, width: `${pct * 100}%` }} />
                    }
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  function renderDietaryPanel() {
    const allDietary: Record<string, { count: number; color: string }> = {};
    let hasSevere = false;
    sortedFunctions.forEach((fn) => {
      (fn.dietaryRequirements ?? []).forEach((d) => {
        if (!allDietary[d.name]) {
          const n = d.name.toLowerCase();
          const color = n.includes("gluten") ? "#22C55E" : n.includes("vegan") ? "#84CC16" : n.includes("nut") ? "#F59E0B" : n.includes("dairy") ? "#60A5FA" : n.includes("shellfish") ? "#F97316" : n.includes("halal") ? "#14B8A6" : "#94A3B8";
          allDietary[d.name] = { count: 0, color };
        }
        allDietary[d.name].count += d.count;
        if (d.name.toLowerCase().includes("nut") || d.name.toLowerCase().includes("shellfish")) hasSevere = true;
      });
    });
    const entries = Object.entries(allDietary);
    if (entries.length === 0) return null;
    return (
      <View style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.secondary }}>
          <Ionicons name="alert-circle-outline" size={13} color={hasSevere ? "#EF4444" : AMBER} />
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1, letterSpacing: 0.5 }}>DIETARY TODAY</Text>
          {hasSevere && <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#EF4444" }}>ALLERGEN</Text>}
        </View>
        <View style={{ padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {entries.map(([name, { count, color }]) => (
            <View key={name} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, backgroundColor: color + "15", borderColor: color + "40" }}>
              <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color }}>{count}×</Text>
              <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.foreground }}>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  function renderRosterSnapshot() {
    const activeStaff = staff.filter((m) => !sickStaffIds.includes(m.id));
    const bySection: Record<string, typeof staff> = {};
    activeStaff.forEach((m) => {
      const key = m.section ?? m.role;
      if (!bySection[key]) bySection[key] = [];
      bySection[key].push(m);
    });
    return (
      <View style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.secondary }}>
          <Ionicons name="people-outline" size={13} color={colors.accent} />
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1, letterSpacing: 0.5 }}>STAFF ON DUTY</Text>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.accent }}>{activeStaff.length} active</Text>
          {sickCount > 0 && <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "#EF4444" }}>{sickCount} sick</Text>}
        </View>
        <View style={{ padding: 12, gap: 6 }}>
          {Object.entries(bySection).slice(0, 6).map(([section, members]) => (
            <View key={section} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, width: 100 }} numberOfLines={1}>{section}</Text>
              <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {members.slice(0, 4).map((m) => (
                  <View key={m.id} style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: colors.secondary, borderRadius: 5 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.foreground }}>{m.name.split(" ")[0]}</Text>
                  </View>
                ))}
                {members.length > 4 && <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground, paddingVertical: 2 }}>+{members.length - 4}</Text>}
              </View>
            </View>
          ))}
          {Object.keys(bySection).length === 0 && (
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>No staff added yet</Text>
          )}
        </View>
      </View>
    );
  }

  const broadcastBanner = showBroadcast && broadcastMessage ? (
    <View style={[s.broadcastBanner, { backgroundColor: AMBER + "12", borderColor: AMBER + "50" }]}>
      <View style={s.broadcastTop}>
        <View style={[s.broadcastIconWrap, { backgroundColor: AMBER + "25" }]}>
          <Ionicons name="megaphone" size={16} color={AMBER} />
        </View>
        <View style={s.broadcastBody}>
          <Text style={[s.broadcastLabel, { color: AMBER }]}>Message to all staff</Text>
          <Text style={s.broadcastText}>{broadcastMessage.text}</Text>
          <Text style={s.broadcastMeta}>From: {broadcastMessage.senderName} · {broadcastMessage.senderRole} · {formatRelativeTime(broadcastMessage.sentAt)}</Text>
        </View>
      </View>
      <View style={[s.broadcastActions, { borderTopColor: AMBER + "30" }]}>
        {isManager ? (
          <>
            <Pressable style={({ pressed }) => [s.broadcastBtn, { opacity: pressed ? 0.7 : 1, borderRightWidth: 1, borderRightColor: AMBER + "30" }]} onPress={openCompose}>
              <Text style={[s.broadcastBtnText, { color: colors.info }]}>Edit</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [s.broadcastBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={handleClearBroadcast}>
              <Text style={[s.broadcastBtnText, { color: "#EF4444" }]}>Remove alert</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={({ pressed }) => [s.broadcastBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); dismissBroadcast(broadcastMessage.id); }}>
            <Text style={[s.broadcastBtnText, { color: colors.mutedForeground }]}>Got it</Text>
          </Pressable>
        )}
      </View>
    </View>
  ) : null;

  const composeModal = (
    <Modal visible={composeVisible} transparent animationType="slide" onRequestClose={() => setComposeVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setComposeVisible(false)}>
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : undefined}>
            <TouchableWithoutFeedback>
              <View style={s.sheet}>
                <View style={s.handle} />
                <View style={s.sheetHeader}>
                  <Ionicons name="megaphone" size={20} color={AMBER} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.sheetTitle}>Send message to all staff</Text>
                    {currentMember && <Text style={s.sheetSub}>From: {currentMember.name} · {currentMember.role}</Text>}
                  </View>
                  <Pressable style={({ pressed }) => [s.closeBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={() => setComposeVisible(false)}>
                    <Feather name="x" size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>
                <Pressable style={s.inputWrap} onPress={() => inputRef.current?.focus()}>
                  <TextInput ref={inputRef} style={s.textInput} placeholder="Type your message here…" placeholderTextColor={colors.mutedForeground} multiline maxLength={200} value={draftText} onChangeText={setDraftText} autoFocus />
                </Pressable>
                <Text style={[s.charCount, { color: draftText.length > 160 ? colors.warning : colors.mutedForeground }]}>{draftText.length}/200</Text>
                <Pressable style={({ pressed }) => [s.sendBtn, { backgroundColor: draftText.trim().length > 0 ? AMBER : colors.secondary, opacity: pressed ? 0.85 : 1 }]} onPress={sendBroadcast} disabled={draftText.trim().length === 0}>
                  <Ionicons name="megaphone" size={16} color={draftText.trim().length > 0 ? "#fff" : colors.mutedForeground} />
                  <Text style={[s.sendBtnText, { color: draftText.trim().length > 0 ? "#fff" : colors.mutedForeground }]}>Send to all staff</Text>
                </Pressable>
                <View style={s.tipRow}>
                  <Ionicons name="information-circle-outline" size={14} color={colors.mutedForeground} />
                  <Text style={s.tipText}>Staff will see this message when they open the app.</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (isTablet) {
    return (
      <View style={[s.root, { flexDirection: "row" }]}>
        {/* ── LEFT COLUMN: main content ───────────────────────────── */}
        <ScrollView style={{ flex: 0.58 }} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.dateLabel}>{todayDate}</Text>
              <Text style={[s.headerTitle, { fontSize: 30 }]}>Today's Service</Text>
            </View>
            {isManager && (
              <Pressable
                style={({ pressed }) => [s.megaBtn, { backgroundColor: showBroadcast ? AMBER + "25" : colors.card, borderColor: showBroadcast ? AMBER + "60" : colors.border, opacity: pressed ? 0.75 : 1 }]}
                onPress={openCompose}
              >
                <Ionicons name="megaphone" size={18} color={showBroadcast ? AMBER : colors.mutedForeground} />
              </Pressable>
            )}
          </View>
          {broadcastBanner}
          <AlertsPanel alerts={alerts} criticalCount={criticalCount} warningCount={warningCount} infoCount={infoCount} onDismiss={dismissAlert} onDismissAll={dismissAll} onPress={(fnId) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fnId}`); }} />
          {renderCountdown()}
          {renderMyShift()}
          {renderFunctionList()}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── RIGHT COLUMN: dashboard panels ─────────────────────── */}
        <ScrollView
          style={{ flex: 0.42, borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.background }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: topPad + 20, paddingBottom: 40 }}>
            <Text style={[s.sectionLabel, { marginHorizontal: 16, marginBottom: 14 }]}>Dashboard</Text>
            {renderPrepOverview()}
            {renderDietaryPanel()}
            {renderRosterSnapshot()}
          </View>
        </ScrollView>

        {composeModal}
      </View>
    );
  }

  return (
    <View style={s.root}>
      <LinearGradient
        colors={["rgba(59,130,246,0.13)", "rgba(6,182,212,0.06)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: topPad + 160, zIndex: 0 }}
      />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.dateLabel}>{todayDate}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <PrepFlowsLogo size={30} />
              <Text style={s.headerTitle}>Today's Service</Text>
            </View>
          </View>
          {isManager && (
            <Pressable
              style={({ pressed }) => [s.megaBtn, { backgroundColor: showBroadcast ? AMBER + "25" : colors.card, borderColor: showBroadcast ? AMBER + "60" : colors.border, opacity: pressed ? 0.75 : 1 }]}
              onPress={openCompose}
            >
              <Ionicons name="megaphone" size={18} color={showBroadcast ? AMBER : colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        {broadcastBanner}
        <AlertsPanel alerts={alerts} criticalCount={criticalCount} warningCount={warningCount} infoCount={infoCount} onDismiss={dismissAlert} onDismissAll={dismissAll} onPress={(fnId) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fnId}`); }} />
        {renderCountdown()}
        {renderMyShift()}
        {renderFunctionList()}
        <View style={s.bottomPad} />
      </ScrollView>
      {composeModal}
    </View>
  );
}

// ─── AlertsPanel component ────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { color: string }> = {
  critical: { color: "#EF4444" },
  warning:  { color: "#F59E0B" },
  info:     { color: "#3B82F6" },
};

const CATEGORY_CONFIG: Record<AlertCategory, { icon: React.ComponentProps<typeof Feather>["name"]; label: string }> = {
  dietary:  { icon: "alert-triangle", label: "Dietary" },
  overlap:  { icon: "copy",           label: "Room conflict" },
  staffing: { icon: "users",          label: "Staffing" },
  timeline: { icon: "clock",          label: "Timeline" },
  prep:     { icon: "check-square",   label: "Prep" },
};

function AlertsPanel({
  alerts,
  criticalCount,
  warningCount,
  infoCount,
  onDismiss,
  onDismissAll,
  onPress,
}: {
  alerts: KitchenAlert[];
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onPress: (functionId: string) => void;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = React.useState(criticalCount > 0);

  React.useEffect(() => {
    if (criticalCount > 0) setExpanded(true);
  }, [criticalCount]);

  if (alerts.length === 0) return null;

  const primaryColor =
    criticalCount > 0 ? "#EF4444" : warningCount > 0 ? "#F59E0B" : "#3B82F6";

  const panelStyles = criticalCount > 0 
    ? { borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)' }
    : warningCount > 0
      ? { borderColor: 'rgba(234,179,8,0.3)', backgroundColor: 'rgba(234,179,8,0.08)' }
      : { borderColor: primaryColor + "45", backgroundColor: colors.card };

  return (
    <View
      style={[
        ap.wrap,
        {
          marginHorizontal: 20,
          marginBottom: 14,
          borderRadius: colors.radius,
          borderColor: panelStyles.borderColor,
          backgroundColor: panelStyles.backgroundColor,
        },
      ]}
    >
      {/* ── Header ── */}
      <Pressable
        style={[
          ap.header,
          {
            backgroundColor: primaryColor + "12",
            borderBottomColor: expanded ? primaryColor + "30" : "transparent",
            borderBottomWidth: expanded ? 1 : 0,
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded((e) => !e);
        }}
      >
        <View style={[ap.headerIcon, { backgroundColor: primaryColor + "25" }]}>
          <Ionicons name="alert-circle" size={15} color={primaryColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[ap.headerTitle, { color: primaryColor }]}>
            {alerts.length} operational alert{alerts.length !== 1 ? "s" : ""}
          </Text>
          <View style={ap.headerBadges}>
            {criticalCount > 0 && (
              <View style={[ap.sevBadge, { backgroundColor: "#EF444420" }]}>
                <Text style={[ap.sevBadgeText, { color: "#EF4444" }]}>{criticalCount} critical</Text>
              </View>
            )}
            {warningCount > 0 && (
              <View style={[ap.sevBadge, { backgroundColor: "#F59E0B20" }]}>
                <Text style={[ap.sevBadgeText, { color: "#F59E0B" }]}>{warningCount} warning</Text>
              </View>
            )}
            {infoCount > 0 && (
              <View style={[ap.sevBadge, { backgroundColor: "#3B82F620" }]}>
                <Text style={[ap.sevBadgeText, { color: "#3B82F6" }]}>{infoCount} info</Text>
              </View>
            )}
          </View>
        </View>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={15} color={primaryColor} />
      </Pressable>

      {/* ── Alert rows ── */}
      {expanded &&
        alerts.map((alert, i) => {
          const sc = SEVERITY_CONFIG[alert.severity]!;
          const cc = CATEGORY_CONFIG[alert.category];
          const isLast = i === alerts.length - 1 && !alerts.some((a) => a.dismissible);
          return (
            <Pressable
              key={alert.id}
              style={[
                ap.row,
                {
                  borderBottomColor: colors.border,
                  borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (alert.functionId) onPress(alert.functionId);
              }}
            >
              <View style={[ap.accentBar, { backgroundColor: sc.color }]} />
              <View style={[ap.catIcon, { backgroundColor: sc.color + "18" }]}>
                <Feather name={cc.icon} size={12} color={sc.color} />
              </View>
              <View style={ap.rowBody}>
                <Text style={[ap.rowTitle, { color: colors.foreground }]}>{alert.title}</Text>
                <Text
                  style={[ap.rowDetail, { color: colors.mutedForeground }]}
                  numberOfLines={2}
                >
                  {alert.detail}
                </Text>
              </View>
              {alert.dismissible && (
                <Pressable
                  hitSlop={8}
                  style={[ap.xBtn, { backgroundColor: colors.secondary }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDismiss(alert.id);
                  }}
                >
                  <Feather name="x" size={11} color={colors.mutedForeground} />
                </Pressable>
              )}
            </Pressable>
          );
        })}

      {/* ── Dismiss-all footer ── */}
      {expanded && alerts.some((a) => a.dismissible) && (
        <Pressable
          style={[ap.dismissAll, { borderTopColor: colors.border, backgroundColor: colors.secondary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDismissAll();
          }}
        >
          <Text style={[ap.dismissAllText, { color: colors.mutedForeground }]}>
            Dismiss all alerts
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const ap = StyleSheet.create({
  wrap:           { borderWidth: 1, overflow: "hidden" },
  header:         { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  headerIcon:     { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  headerTitle:    { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 3 },
  headerBadges:   { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  sevBadge:       { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sevBadgeText:   { fontSize: 10, fontFamily: "Inter_700Bold" },
  row:            { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, paddingRight: 10 },
  accentBar:      { width: 3, alignSelf: "stretch", borderRadius: 2, marginRight: 10 },
  catIcon:        { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 1, flexShrink: 0 },
  rowBody:        { flex: 1 },
  rowTitle:       { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  rowDetail:      { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  xBtn:           { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginLeft: 8, marginTop: 2, flexShrink: 0 },
  dismissAll:     { paddingVertical: 10, alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth },
  dismissAllText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
