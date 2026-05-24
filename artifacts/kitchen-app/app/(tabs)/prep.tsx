import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { PrepTeam, getAccessLevel, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";
import { useIsTablet } from "@/hooks/useIsTablet";

const TEAM_ORDER: PrepTeam[] = ["Cold Larder", "Butchery", "Hot Kitchen", "Pastry", "Function Team"];

export function getTeamColor(team: PrepTeam): string {
  switch (team) {
    case "Cold Larder":   return "#14B8A6";
    case "Butchery":      return "#F97316";
    case "Hot Kitchen":   return "#EF4444";
    case "Pastry":        return "#A78BFA";
    case "Function Team": return "#3B82F6";
    default:              return "#6B7A94";
  }
}

function getTeamDescription(team: PrepTeam): string {
  switch (team) {
    case "Cold Larder":   return "Cold starters, salads, sauces, canapé prep";
    case "Butchery":      return "Meat portioning, trimming & protein prep";
    case "Hot Kitchen":   return "Hot mains, hot sauces, firing & cooking";
    case "Pastry":        return "Desserts, pastry & baked goods";
    case "Function Team": return "Room setup, food assembly & service running";
    default:              return "";
  }
}

type DateKey = "today" | "tomorrow" | "day-after";
type ViewMode = "by-team" | "by-event";

function isoOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function shortDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

export default function PrepScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isTablet = useIsTablet();
  const { functions, prepItems, staff, currentStaffId, togglePrepItem } = useKitchen();
  const [selectedDate, setSelectedDate] = useState<DateKey>("today");
  const [viewMode, setViewMode] = useState<ViewMode>("by-team");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const accessLevel = currentMember ? getAccessLevel(currentMember) : null;
  const canToggle = accessLevel === "manager" || accessLevel === "team_leader";

  const dateISOs: Record<DateKey, string> = useMemo(() => ({
    "today":     isoOffset(0),
    "tomorrow":  isoOffset(1),
    "day-after": isoOffset(2),
  }), []);

  const DATE_TABS: { key: DateKey; label: string; short: string }[] = useMemo(() => [
    { key: "today",     label: "Today",     short: shortDate(0) },
    { key: "tomorrow",  label: "Tomorrow",  short: shortDate(1) },
    { key: "day-after", label: "Day After", short: shortDate(2) },
  ], []);

  const activeFunctions = useMemo(() => {
    const iso = dateISOs[selectedDate];
    return functions.filter((fn) => (fn.date ?? dateISOs["today"]) === iso);
  }, [functions, selectedDate, dateISOs]);

  const activeFunctionIds = useMemo(() => new Set(activeFunctions.map((f) => f.id)), [activeFunctions]);

  const filteredItems = useMemo(() => {
    return prepItems.filter((p) => activeFunctionIds.has(p.functionId));
  }, [prepItems, activeFunctionIds]);

  const totalItems = filteredItems.length;
  const completedItems = filteredItems.filter((p) => p.completed).length;
  const percent = totalItems > 0 ? completedItems / totalItems : 0;

  const byTeam = useMemo(() => {
    const map: Partial<Record<PrepTeam, typeof filteredItems>> = {};
    filteredItems.forEach((item) => {
      if (!map[item.team]) map[item.team] = [];
      map[item.team]!.push(item);
    });
    return map;
  }, [filteredItems]);

  const byEvent = useMemo(() => {
    const fnIds = [...new Set(filteredItems.map((p) => p.functionId))];
    return fnIds.map((fnId) => {
      const fn = activeFunctions.find((f) => f.id === fnId)!;
      const items = filteredItems.filter((p) => p.functionId === fnId);
      const teamMap: Partial<Record<PrepTeam, typeof items>> = {};
      items.forEach((item) => {
        if (!teamMap[item.team]) teamMap[item.team] = [];
        teamMap[item.team]!.push(item);
      });
      return { fn, teamMap };
    });
  }, [filteredItems, activeFunctions]);

  function getLeader(team: PrepTeam) {
    return staff.find((s) => s.teamLeadFor === team) ?? null;
  }

  function getTeamMembers(team: PrepTeam) {
    return staff.filter((s) => s.section === team && !s.teamLeadFor);
  }

  function handleToggle(itemId: string) {
    if (!canToggle) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Access Restricted",
        "Only Kitchen Managers, Head Chefs and Team Leaders can mark prep tasks as done.",
        [{ text: "OK" }]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePrepItem(itemId);
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 4, flexDirection: "row", alignItems: "flex-end" },
    headerLeft: { flex: 1 },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    printBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginBottom: 4 },
    printBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },

    dateTabs: { flexDirection: "row", marginHorizontal: 20, marginTop: 16, gap: 8 },
    dateTab: { flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1.5 },
    dateTabLabel: { fontSize: 13, fontFamily: "Inter_700Bold" },
    dateTabSub: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },

    accessBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 20, marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    accessBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },

    progressArea: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
    progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    progressLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    progressCount: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground },
    progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: 6, borderRadius: 3 },

    viewToggle: { flexDirection: "row", marginHorizontal: 20, marginTop: 14, marginBottom: 2, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden", backgroundColor: colors.card },
    toggleBtn: { flex: 1, paddingVertical: 9, alignItems: "center" },
    toggleBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

    emptyBox: { margin: 20, padding: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 8 },
    emptyTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    emptySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" },

    teamSection: { marginTop: 16 },
    teamHeaderCard: { marginHorizontal: 20, marginBottom: 2, borderRadius: colors.radius, borderWidth: 1, overflow: "hidden" },
    teamCardTop: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
    teamColorBlock: { width: 5, borderRadius: 3, alignSelf: "stretch", minHeight: 36 },
    teamCardInfo: { flex: 1 },
    teamName: { fontSize: 15, fontFamily: "Inter_700Bold" },
    teamDesc: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    teamBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    teamBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    leaderRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
    leaderAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    leaderAvatarText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    leaderInfo: { flex: 1 },
    leaderLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 1 },
    leaderName: { fontSize: 13, fontFamily: "Inter_700Bold" },
    leaderRole: { fontSize: 11, fontFamily: "Inter_400Regular" },
    membersRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, flexWrap: "wrap" },
    membersLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginRight: 4 },
    memberPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
    memberPillText: { fontSize: 11, fontFamily: "Inter_500Medium" },

    eventBlock: { marginTop: 16 },
    eventHeader: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 8, gap: 10 },
    eventTimePill: { backgroundColor: colors.primary, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
    eventTimePillText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    eventName: { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground },
    eventRoom: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    subTeamHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 8, gap: 8, backgroundColor: colors.secondary },
    subTeamDot: { width: 8, height: 8, borderRadius: 4 },
    subTeamLabel: { flex: 1, fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8, textTransform: "uppercase" },
    subLeaderText: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    subTeamCount: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground },

    itemRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 },
    teamColorBar: { width: 3, borderRadius: 2, alignSelf: "stretch" },
    checkbox: { width: 28, height: 28, borderRadius: 7, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2 },
    itemContent: { flex: 1 },
    itemTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 3 },
    dishName: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
    deadlinePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    deadlineText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    badgeRow: { flexDirection: "row", gap: 6, marginBottom: 4, flexWrap: "wrap" },
    prevDayBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: "#8B5CF620" },
    prevDayText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#8B5CF6" },
    functionTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.secondary },
    functionTagText: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    quantity: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary, marginBottom: 3 },
    note: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 17 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  function renderItem(item: typeof filteredItems[0], showFnTag = false) {
    const tc = getTeamColor(item.team);
    const isDayBefore = item.prepDay === "day-before";
    const fn = activeFunctions.find((f) => f.id === item.functionId);

    return (
      <Pressable
        key={item.id}
        style={({ pressed }) => [s.itemRow, pressed && { backgroundColor: colors.secondary }]}
        onPress={() => handleToggle(item.id)}
      >
        <View style={[s.teamColorBar, { backgroundColor: tc, opacity: item.completed ? 0.3 : 1 }]} />
        <View style={[
          s.checkbox,
          item.completed
            ? { backgroundColor: colors.accent, borderColor: colors.accent }
            : canToggle
              ? { backgroundColor: "transparent", borderColor: colors.border }
              : { backgroundColor: "transparent", borderColor: colors.border + "80" }
        ]}>
          {item.completed
            ? <Feather name="check" size={15} color="#fff" />
            : !canToggle
              ? <Feather name="lock" size={11} color={colors.mutedForeground} />
              : null
          }
        </View>
        <View style={s.itemContent}>
          <View style={s.itemTopRow}>
            <Text style={[s.dishName, { color: item.completed ? colors.mutedForeground : colors.foreground, textDecorationLine: item.completed ? "line-through" : "none" }]}>
              {item.dish}
            </Text>
            <View style={[s.deadlinePill, { backgroundColor: item.completed ? colors.accent + "20" : "#EF444420" }]}>
              <Feather name="clock" size={10} color={item.completed ? colors.accent : "#EF4444"} />
              <Text style={[s.deadlineText, { color: item.completed ? colors.accent : "#EF4444" }]}>
                {item.completed ? "Done" : item.deadline}
              </Text>
            </View>
          </View>
          <View style={s.badgeRow}>
            {isDayBefore && (
              <View style={s.prevDayBadge}>
                <Ionicons name="moon" size={9} color="#8B5CF6" />
                <Text style={s.prevDayText}>PREV DAY</Text>
              </View>
            )}
            {showFnTag && fn && (
              <View style={s.functionTag}>
                <Text style={s.functionTagText}>{fn.room}</Text>
              </View>
            )}
          </View>
          <Text style={s.quantity}>{item.quantity}</Text>
          {item.note ? <Text style={s.note}>{item.note}</Text> : null}
        </View>
      </Pressable>
    );
  }

  const printFnId = activeFunctions[0]?.id;

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.title}>Prep List</Text>
            <Text style={s.subtitle}>By team — with leader, tasks & deadlines</Text>
          </View>
          {printFnId && (
            <Pressable style={({ pressed }) => [s.printBtn, pressed && { opacity: 0.7 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/prep-print/${printFnId}`); }}>
              <Feather name="printer" size={13} color={colors.mutedForeground} />
              <Text style={s.printBtnText}>Print</Text>
            </Pressable>
          )}
        </View>

        <View style={s.dateTabs}>
          {DATE_TABS.map((tab) => {
            const active = selectedDate === tab.key;
            const count = prepItems.filter((p) => {
              const fn = functions.find((f) => f.id === p.functionId);
              return (fn?.date ?? dateISOs["today"]) === dateISOs[tab.key];
            }).length;
            return (
              <Pressable
                key={tab.key}
                style={[s.dateTab, {
                  backgroundColor: active ? "transparent" : colors.card,
                  borderColor: active ? "#3B82F6" : colors.border,
                  overflow: "hidden",
                }]}
                onPress={() => { Haptics.selectionAsync(); setSelectedDate(tab.key); }}
              >
                {active && (
                  <LinearGradient
                    colors={["#3B82F6", "#06B6D4", "#818CF8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  />
                )}
                <Text style={[s.dateTabLabel, { color: active ? "#fff" : colors.foreground }]}>
                  {tab.label}
                </Text>
                <Text style={[s.dateTabSub, { color: active ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
                  {tab.short}
                </Text>
                {count > 0 && (
                  <View style={{ marginTop: 4, backgroundColor: active ? "rgba(255,255,255,0.25)" : colors.primary + "25", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: active ? "#fff" : colors.primary }}>
                      {count} tasks
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {!canToggle && currentStaffId && (
          <View style={[s.accessBadge, { backgroundColor: "#8B5CF610", borderColor: "#8B5CF630" }]}>
            <Feather name="lock" size={14} color="#8B5CF6" />
            <Text style={[s.accessBadgeText, { color: "#8B5CF6" }]}>
              View only — only managers and team leaders can check off prep tasks
            </Text>
          </View>
        )}
        {!currentStaffId && (
          <View style={[s.accessBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[s.accessBadgeText, { color: colors.mutedForeground }]}>
              Set your identity in Roster to check off prep tasks
            </Text>
          </View>
        )}

        {totalItems > 0 && (
          <View style={s.progressArea}>
            <View style={s.progressRow}>
              <Text style={s.progressLabel}>
                {selectedDate === "today" ? "Today's prep progress" : selectedDate === "tomorrow" ? "Tomorrow's prep progress" : "Day-after prep progress"}
              </Text>
              <Text style={s.progressCount}>{completedItems} / {totalItems} done</Text>
            </View>
            <View style={s.progressBar}>
              {percent === 1
                ? <View style={[s.progressFill, { width: "100%", backgroundColor: colors.accent }]} />
                : <LinearGradient colors={["#3B82F6", "#06B6D4", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.progressFill, { width: `${percent * 100}%` }]} />
              }
            </View>
          </View>
        )}

        {filteredItems.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="checkmark-circle-outline" size={36} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>No prep for this day</Text>
            <Text style={s.emptySubtitle}>
              There are no functions or prep tasks scheduled for {DATE_TABS.find((t) => t.key === selectedDate)?.short}.
            </Text>
          </View>
        ) : (
          <>
            <View style={s.viewToggle}>
              <Pressable style={[s.toggleBtn, viewMode === "by-team" && { backgroundColor: "transparent", overflow: "hidden" }]} onPress={() => setViewMode("by-team")}>
                {viewMode === "by-team" && (
                  <LinearGradient colors={["#3B82F6", "#06B6D4", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
                )}
                <Text style={[s.toggleBtnText, { color: viewMode === "by-team" ? "#fff" : colors.mutedForeground }]}>By Team</Text>
              </Pressable>
              <Pressable style={[s.toggleBtn, viewMode === "by-event" && { backgroundColor: "transparent", overflow: "hidden" }]} onPress={() => setViewMode("by-event")}>
                {viewMode === "by-event" && (
                  <LinearGradient colors={["#3B82F6", "#06B6D4", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
                )}
                <Text style={[s.toggleBtnText, { color: viewMode === "by-event" ? "#fff" : colors.mutedForeground }]}>By Event</Text>
              </Pressable>
            </View>

            {viewMode === "by-team" && (
              <View style={isTablet ? { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8 } : {}}>
              {TEAM_ORDER.map((team) => {
              const items = byTeam[team];
              if (!items || items.length === 0) return null;
              const done = items.filter((i) => i.completed).length;
              const tc = getTeamColor(team);
              const allDone = done === items.length;
              const leader = getLeader(team);
              const members = getTeamMembers(team);

              return (
                <View key={team} style={[s.teamSection, isTablet && { width: "50%", paddingHorizontal: 4 }]}>
                  <View style={[s.teamHeaderCard, { borderColor: tc + "40" }]}>
                    <View style={[s.teamCardTop, { backgroundColor: tc + "12" }]}>
                      <View style={[s.teamColorBlock, { backgroundColor: tc }]} />
                      <View style={s.teamCardInfo}>
                        <Text style={[s.teamName, { color: tc }]}>{team}</Text>
                        <Text style={s.teamDesc}>{getTeamDescription(team)}</Text>
                      </View>
                      <View style={[s.teamBadge, { backgroundColor: allDone ? colors.accent + "20" : tc + "20" }]}>
                        <Text style={[s.teamBadgeText, { color: allDone ? colors.accent : tc }]}>{done}/{items.length}</Text>
                      </View>
                    </View>
                    {leader && (
                      <View style={[s.leaderRow, { borderTopColor: tc + "30", backgroundColor: tc + "08" }]}>
                        <View style={[s.leaderAvatar, { backgroundColor: tc + "30" }]}>
                          <Text style={[s.leaderAvatarText, { color: tc }]}>
                            {leader.name.split(" ").map((n) => n[0]).join("")}
                          </Text>
                        </View>
                        <View style={s.leaderInfo}>
                          <Text style={[s.leaderLabel, { color: tc }]}>Chef in Charge / Team Leader</Text>
                          <Text style={[s.leaderName, { color: colors.foreground }]}>{leader.name}</Text>
                          <Text style={[s.leaderRole, { color: tc }]}>{leader.role}</Text>
                        </View>
                        <View style={{ alignItems: "center" }}>
                          <Ionicons name="shield-checkmark" size={18} color={tc} />
                        </View>
                      </View>
                    )}
                    {members.length > 0 && (
                      <View style={[s.membersRow, { borderTopColor: tc + "20" }]}>
                        <Text style={s.membersLabel}>Team:</Text>
                        {members.map((m) => (
                          <View key={m.id} style={[s.memberPill, { backgroundColor: tc + "15", borderColor: tc + "35" }]}>
                            <Text style={[s.memberPillText, { color: tc }]}>{m.name.split(" ")[0]}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  {items.map((item) => renderItem(item, activeFunctions.length > 1))}
                </View>
              );
            })}
              </View>
            )}

            {viewMode === "by-event" && (
              <View style={isTablet ? { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8 } : {}}>
              {byEvent.map(({ fn, teamMap }) => {
              if (!fn) return null;
              const fnItems = filteredItems.filter((p) => p.functionId === fn.id);
              const fnDone = fnItems.filter((p) => p.completed).length;
              return (
                <View key={fn.id} style={[s.eventBlock, isTablet && { width: "50%", paddingHorizontal: 4 }]}>
                  <View style={s.eventHeader}>
                    <View style={s.eventTimePill}><Text style={s.eventTimePillText}>{fn.startTime}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.eventName} numberOfLines={1}>{fn.name}</Text>
                      <Text style={s.eventRoom}>Room: {fn.room} · {fn.guestCount} guests · {fnDone}/{fnItems.length} done</Text>
                    </View>
                    <Pressable style={({ pressed }) => [s.printBtn, pressed && { opacity: 0.7 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/prep-print/${fn.id}`); }}>
                      <Feather name="printer" size={13} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                  {TEAM_ORDER.map((team) => {
                    const items = teamMap[team];
                    if (!items || items.length === 0) return null;
                    const done = items.filter((i) => i.completed).length;
                    const tc = getTeamColor(team);
                    const leader = getLeader(team);
                    return (
                      <View key={team}>
                        <View style={s.subTeamHeader}>
                          <View style={[s.subTeamDot, { backgroundColor: tc }]} />
                          <Text style={[s.subTeamLabel, { color: tc }]}>{team}</Text>
                          {leader && <Text style={s.subLeaderText}>{leader.name}</Text>}
                          <Text style={s.subTeamCount}> · {done}/{items.length}</Text>
                        </View>
                        {items.map((item) => renderItem(item, false))}
                      </View>
                    );
                  })}
                </View>
              );
            })}
              </View>
            )}
          </>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
