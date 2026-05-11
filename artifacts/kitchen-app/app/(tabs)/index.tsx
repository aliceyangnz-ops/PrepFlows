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
import { useColors } from "@/hooks/useColors";

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

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

  const sortedFunctions = [...functions].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const nextFn = sortedFunctions.find((f) => timeToMinutes(f.startTime) > nowMinutes) ?? sortedFunctions[0] ?? null;
  const nextFnMins = nextFn ? timeToMinutes(nextFn.startTime) - nowMinutes : null;
  const sickCount = sickStaffIds.length;

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
    // Next event countdown widget
    countdownCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: colors.radius, borderWidth: 2, overflow: "hidden" },
    countdownHeader: { paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6, borderBottomWidth: 1 },
    countdownHeaderText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.2, textTransform: "uppercase" },
    countdownBody: { padding: 16 },
    countdownMinRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 2 },
    countdownNum: { fontSize: 52, fontFamily: "Inter_700Bold", lineHeight: 56 },
    countdownUnit: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
    countdownName: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    countdownMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 3 },
    // My card
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
    // Section labels
    sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, textTransform: "uppercase", marginHorizontal: 20, marginBottom: 10 },
    // Unified function cards
    fnCard: { marginHorizontal: 20, marginBottom: 10, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 2, borderColor: colors.border, overflow: "hidden" },
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
    // Section progress rows inside card
    fnSectionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    fnSectionLabel: { fontSize: 10, fontFamily: "Inter_700Bold", width: 76, textTransform: "uppercase", letterSpacing: 0.4 },
    fnSectionBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" },
    fnSectionFill: { height: 6, borderRadius: 3 },
    fnSectionPct: { fontSize: 10, fontFamily: "Inter_700Bold", width: 30, textAlign: "right" },
    // Dietary + alert badges
    fnAlertRow: { flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingBottom: 10, flexWrap: "wrap" },
    fnAlertBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    fnAlertText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    // Glance legacy (keep for layout compat)
    glanceCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    glanceHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.secondary },
    glanceHeaderText: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1 },
    glanceRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    glanceTime: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.primary, width: 46 },
    glanceInfo: { flex: 1 },
    glanceName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    glanceSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    glanceTypePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    glanceTypeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    glancePax: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignItems: "center" },
    glancePaxNum: { fontSize: 14, fontFamily: "Inter_700Bold" },
    glancePaxLabel: { fontSize: 9, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
    chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    chipText: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    teamRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
    avatar: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    avatarText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
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

  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.dateLabel}>{todayDate}</Text>
            <Text style={s.headerTitle}>Today's Service</Text>
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

        {showBroadcast && broadcastMessage && (
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
        )}

        {/* ── NEXT EVENT COUNTDOWN ──────────────────────────────────── */}
        {nextFn && nextFnMins !== null && (
          <Pressable
            style={({ pressed }) => [
              s.countdownCard,
              {
                borderColor: nextFnMins <= 30 ? "#EF4444" : nextFnMins <= 60 ? AMBER : colors.primary,
                backgroundColor: nextFnMins <= 30 ? "#EF444408" : nextFnMins <= 60 ? AMBER + "08" : colors.primary + "08",
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${nextFn.id}`); }}
          >
            <View style={[
              s.countdownHeader,
              { borderBottomColor: nextFnMins <= 30 ? "#EF444430" : nextFnMins <= 60 ? AMBER + "40" : colors.primary + "30",
                backgroundColor: nextFnMins <= 30 ? "#EF444412" : nextFnMins <= 60 ? AMBER + "12" : colors.primary + "12" }
            ]}>
              <Ionicons name="timer-outline" size={14} color={nextFnMins <= 30 ? "#EF4444" : nextFnMins <= 60 ? AMBER : colors.primary} />
              <Text style={[s.countdownHeaderText, { color: nextFnMins <= 30 ? "#EF4444" : nextFnMins <= 60 ? AMBER : colors.primary }]}>
                {nextFnMins <= 0 ? "NOW" : "Next Event"}
              </Text>
              {sickCount > 0 && (
                <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#EF444420", borderRadius: 6 }}>
                  <Ionicons name="alert-circle" size={12} color="#EF4444" />
                  <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#EF4444" }}>{sickCount} sick today</Text>
                </View>
              )}
            </View>
            <View style={s.countdownBody}>
              <View style={s.countdownMinRow}>
                <Text style={[s.countdownNum, { color: nextFnMins <= 30 ? "#EF4444" : nextFnMins <= 60 ? AMBER : colors.primary }]}>
                  {nextFnMins <= 0 ? "NOW" : nextFnMins >= 60 ? `${Math.floor(nextFnMins / 60)}h ${nextFnMins % 60}m` : nextFnMins}
                </Text>
                {nextFnMins > 0 && nextFnMins < 60 && (
                  <Text style={[s.countdownUnit, { color: nextFnMins <= 30 ? "#EF4444" : AMBER }]}>min</Text>
                )}
              </View>
              <Text style={s.countdownName} numberOfLines={1}>{nextFn.name}</Text>
              <Text style={s.countdownMeta}>{nextFn.room} · {nextFn.floor} · {nextFn.guestCount} guests · {nextFn.startTime}–{nextFn.endTime}</Text>
            </View>
          </Pressable>
        )}

        {/* ── MY SHIFT CARD ─────────────────────────────────────────── */}
        {currentMember && (() => {
          const rc = getRoleColor(currentMember.role, colors);
          return (
            <View style={[s.myCard, { backgroundColor: rc + "10", borderColor: rc + "40" }]}>
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
            </View>
          );
        })()}

        {/* ── TODAY'S FUNCTIONS ────────────────────────────────────── */}
        <Text style={s.sectionLabel}>Today's Functions</Text>

        {sortedFunctions.length === 0 && (
          <View style={{ marginHorizontal: 20, padding: 24, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 8 }}>
            <Feather name="calendar" size={28} color={colors.mutedForeground} />
            <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>No functions today</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" }}>Add functions from the Functions tab</Text>
          </View>
        )}

        {isManager ? (
          /* ── MANAGER: full cards with prep + dietary ─────────── */
          sortedFunctions.map((fn, idx) => {
            const tc = getFunctionTypeColor(fn.functionType);
            const meal = getMealCategory(fn.startTime);
            const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
            const isNextEvent = nextFn?.id === fn.id;
            const TEAMS: PrepTeam[] = ["Hot Kitchen", "Cold Larder", "Pastry", "Function Team", "Butchery"];
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
            const frameColor = isActive ? colors.accent : isUrgent ? "#EF4444" : meal.color;
            return (
              <View key={fn.id} style={[s.fnCard, { borderColor: frameColor + "70" }]}>
                <View style={s.fnCardTop}>
                  {/* ── LEFT SQUARE: #number · time · type ── */}
                  <View style={[s.fnTimeBadge, { backgroundColor: frameColor + "18", borderRightColor: frameColor + "35" }]}>
                    <Text style={[s.fnTimeBadgeNum, { color: frameColor }]}>#{idx + 1}</Text>
                    <Text style={[s.fnTimeBadgeText, { color: frameColor }]}>{fn.startTime}</Text>
                    <Text style={[s.fnTimeBadgeEnd, { color: frameColor + "90" }]}>{fn.endTime}</Text>
                    <Text style={[s.fnTimeBadgeType, { color: frameColor }]} numberOfLines={2}>{abbreviateType(fn.functionType)}</Text>
                    {isActive && <View style={{ marginTop: 5, paddingHorizontal: 4, paddingVertical: 1, backgroundColor: colors.accent, borderRadius: 4 }}><Text style={{ fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff" }}>LIVE</Text></View>}
                  </View>
                  <View style={s.fnBody}>
                    <Text style={s.fnName} numberOfLines={1}>{fn.name}</Text>
                    <View style={s.fnMetaRow}>
                      <View style={[{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: meal.color + "20", borderWidth: 1, borderColor: meal.color + "45" }]}>
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
                        <Feather name="clock" size={10} color={frameColor} />
                        <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: frameColor }}>{nextCourse.label}: {nextCourse.time}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {(totalDietary > 0 || hasSevere) && (
                  <View style={s.fnAlertRow}>
                    {hasSevere && <View style={[s.fnAlertBadge, { backgroundColor: "#EF444412", borderColor: "#EF444440" }]}><Ionicons name="alert-circle" size={12} color="#EF4444" /><Text style={[s.fnAlertText, { color: "#EF4444" }]}>Severe allergen</Text></View>}
                    {dietaryReqs.slice(0, 3).map((d, i) => {
                      const dc = (() => { const n = d.name.toLowerCase(); if (n.includes("gluten")) return "#22C55E"; if (n.includes("vegan")) return "#84CC16"; if (n.includes("nut")) return "#F59E0B"; if (n.includes("dairy")) return "#60A5FA"; if (n.includes("shellfish")) return "#F97316"; if (n.includes("halal")) return "#14B8A6"; return "#94A3B8"; })();
                      return <View key={i} style={[s.fnAlertBadge, { backgroundColor: dc + "15", borderColor: dc + "40" }]}><Text style={[s.fnAlertText, { color: dc }]}>{d.count}× {d.name}</Text></View>;
                    })}
                    {dietaryReqs.length > 3 && <View style={[s.fnAlertBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}><Text style={[s.fnAlertText, { color: colors.mutedForeground }]}>+{dietaryReqs.length - 3} more</Text></View>}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          /* ── STAFF/TEAM LEADER: compact rows ─────────────────── */
          sortedFunctions.map((fn, idx) => {
            const meal = getMealCategory(fn.startTime);
            const isMyFn = myFunctions.some((f) => f.id === fn.id);
            const fnMins = timeToMinutes(fn.startTime) - nowMinutes;
            const isActive = fnMins <= 0 && timeToMinutes(fn.endTime) > nowMinutes;
            const dietaryReqs = fn.dietaryRequirements ?? [];
            const hasSevere = dietaryReqs.some((d) => d.name.toLowerCase().includes("nut") || d.name.toLowerCase().includes("shellfish"));
            const frameColor = isActive ? colors.accent : meal.color;
            return (
              <View key={fn.id} style={[s.fnCard, { borderColor: isMyFn ? frameColor + "90" : frameColor + "55" }]}>
                <View style={s.fnCardTop}>
                  {/* ── LEFT SQUARE: #number · time · type ── */}
                  <View style={[s.fnTimeBadge, { backgroundColor: frameColor + "18", borderRightColor: frameColor + "35" }]}>
                    <Text style={[s.fnTimeBadgeNum, { color: frameColor }]}>#{idx + 1}</Text>
                    <Text style={[s.fnTimeBadgeText, { color: frameColor }]}>{fn.startTime}</Text>
                    <Text style={[s.fnTimeBadgeEnd, { color: frameColor + "90" }]}>{fn.endTime}</Text>
                    <Text style={[s.fnTimeBadgeType, { color: frameColor }]} numberOfLines={2}>{abbreviateType(fn.functionType)}</Text>
                    {isActive && <View style={{ marginTop: 5, paddingHorizontal: 4, paddingVertical: 1, backgroundColor: colors.accent, borderRadius: 4 }}><Text style={{ fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff" }}>LIVE</Text></View>}
                  </View>
                  <View style={s.fnBody}>
                    <Text style={s.fnName} numberOfLines={1}>{fn.name}</Text>
                    <View style={s.fnMetaRow}>
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: meal.color + "20", borderWidth: 1, borderColor: meal.color + "45" }}>
                        <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: meal.color }}>{meal.label}</Text>
                      </View>
                      <View style={s.fnMetaChip}><MaterialCommunityIcons name="door" size={10} color={colors.mutedForeground} /><Text style={s.fnMetaChipText}>{fn.room}</Text></View>
                      <View style={s.fnMetaChip}><Ionicons name="layers-outline" size={10} color={colors.mutedForeground} /><Text style={s.fnMetaChipText}>{fn.floor}</Text></View>
                      <View style={s.fnMetaChip}><Ionicons name="people" size={10} color={colors.mutedForeground} /><Text style={s.fnMetaChipText}>{fn.guestCount} pax</Text></View>
                      {isMyFn && <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: frameColor + "22", borderRadius: 5 }}><Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: frameColor }}>Your function</Text></View>}
                    </View>
                    {hasSevere && <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}><Ionicons name="alert-circle" size={11} color="#EF4444" /><Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#EF4444" }}>Severe allergen</Text></View>}
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View style={s.bottomPad} />
      </ScrollView>

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
    </View>
  );
}
