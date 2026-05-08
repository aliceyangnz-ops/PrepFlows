import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrepTeam, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

const TEAM_ORDER: PrepTeam[] = ["Cold Larder", "Butchery", "Hot Kitchen", "Pastry", "Catering"];

function getTeamColor(team: PrepTeam): string {
  switch (team) {
    case "Cold Larder": return "#14B8A6";
    case "Butchery":    return "#F97316";
    case "Hot Kitchen": return "#EF4444";
    case "Pastry":      return "#A78BFA";
    case "Catering":    return "#3B82F6";
    default:            return "#6B7A94";
  }
}

function getTeamIcon(team: PrepTeam): string {
  switch (team) {
    case "Cold Larder": return "thermometer";
    case "Butchery":    return "scissors";
    case "Hot Kitchen": return "zap";
    case "Pastry":      return "star";
    case "Catering":    return "users";
    default:            return "circle";
  }
}

type ViewMode = "by-team" | "by-event";

export default function PrepScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { functions, prepItems, togglePrepItem } = useKitchen();
  const [selectedFunctionId, setSelectedFunctionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("by-team");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filteredItems = useMemo(() => {
    if (!selectedFunctionId) return prepItems;
    return prepItems.filter((p) => p.functionId === selectedFunctionId);
  }, [prepItems, selectedFunctionId]);

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
      const fn = functions.find((f) => f.id === fnId)!;
      const items = filteredItems.filter((p) => p.functionId === fnId);
      const teamMap: Partial<Record<PrepTeam, typeof items>> = {};
      items.forEach((item) => {
        if (!teamMap[item.team]) teamMap[item.team] = [];
        teamMap[item.team]!.push(item);
      });
      return { fn, teamMap };
    });
  }, [filteredItems, functions]);

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 4, flexDirection: "row", alignItems: "flex-end" },
    headerLeft: { flex: 1 },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    printBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginBottom: 4 },
    printBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    progressArea: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
    progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    progressLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    progressCount: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground },
    progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: 6, borderRadius: 3 },
    filterSection: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
    filterLabel: { fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
    filterRow: { flexDirection: "row", gap: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    viewToggle: { flexDirection: "row", marginHorizontal: 20, marginTop: 14, marginBottom: 2, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden", backgroundColor: colors.card },
    toggleBtn: { flex: 1, paddingVertical: 9, alignItems: "center", justifyContent: "center" },
    toggleBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    teamSection: { marginTop: 16 },
    teamHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
    teamStripe: { width: 4, height: 32, borderRadius: 2 },
    teamHeaderInfo: { flex: 1 },
    teamName: { fontSize: 14, fontFamily: "Inter_700Bold" },
    teamSubLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    teamBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    teamBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    eventBlock: { marginTop: 16 },
    eventHeader: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 10, gap: 10 },
    eventTimePill: { backgroundColor: colors.primary, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
    eventTimePillText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    eventName: { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground },
    eventRoom: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    subTeamHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 7, gap: 8, backgroundColor: colors.secondary },
    subTeamDot: { width: 8, height: 8, borderRadius: 4 },
    subTeamLabel: { flex: 1, fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8, textTransform: "uppercase" },
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
    teamTagPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    teamTagText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    functionTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.secondary },
    functionTagText: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    quantity: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary, marginBottom: 3 },
    note: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 17 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  function renderItem(item: ReturnType<typeof useKitchen>["prepItems"][0], showTeamTag = false, showFnTag = false) {
    const tc = getTeamColor(item.team);
    const isDayBefore = item.prepDay === "day-before";
    const fn = functions.find((f) => f.id === item.functionId);

    return (
      <Pressable
        key={item.id}
        style={({ pressed }) => [s.itemRow, pressed && { backgroundColor: colors.secondary }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); togglePrepItem(item.id); }}
      >
        <View style={[s.teamColorBar, { backgroundColor: tc, opacity: item.completed ? 0.3 : 1 }]} />
        <View style={[s.checkbox, { backgroundColor: item.completed ? colors.accent : "transparent", borderColor: item.completed ? colors.accent : colors.border }]}>
          {item.completed && <Feather name="check" size={15} color="#fff" />}
        </View>
        <View style={s.itemContent}>
          <View style={s.itemTopRow}>
            <Text style={[s.dishName, { color: item.completed ? colors.mutedForeground : colors.foreground, textDecorationLine: item.completed ? "line-through" : "none", flex: 1 }]}>
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
            {showTeamTag && (
              <View style={[s.teamTagPill, { backgroundColor: tc + "20" }]}>
                <Text style={[s.teamTagText, { color: tc }]}>{item.team}</Text>
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

  const printFnId = selectedFunctionId ?? functions[0]?.id;

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.title}>Prep List</Text>
            <Text style={s.subtitle}>Track what each team needs to complete</Text>
          </View>
          {printFnId && (
            <Pressable
              style={({ pressed }) => [s.printBtn, pressed && { opacity: 0.7 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/prep-print/${printFnId}`); }}
            >
              <Feather name="printer" size={14} color={colors.mutedForeground} />
              <Text style={s.printBtnText}>Print Sheet</Text>
            </Pressable>
          )}
        </View>

        <View style={s.progressArea}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Overall prep progress</Text>
            <Text style={s.progressCount}>{completedItems} / {totalItems} done</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${percent * 100}%`, backgroundColor: percent === 1 ? colors.accent : colors.primary }]} />
          </View>
        </View>

        <View style={s.filterSection}>
          <Text style={s.filterLabel}>Filter by event</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            <Pressable style={[s.filterChip, { backgroundColor: !selectedFunctionId ? colors.primary : "transparent", borderColor: !selectedFunctionId ? colors.primary : colors.border }]} onPress={() => setSelectedFunctionId(null)}>
              <Text style={[s.filterText, { color: !selectedFunctionId ? "#fff" : colors.mutedForeground }]}>All events</Text>
            </Pressable>
            {functions.map((fn) => {
              const active = selectedFunctionId === fn.id;
              const fnItems = prepItems.filter((p) => p.functionId === fn.id);
              const fnDone = fnItems.filter((p) => p.completed).length;
              return (
                <Pressable key={fn.id} style={[s.filterChip, { backgroundColor: active ? colors.primary : "transparent", borderColor: active ? colors.primary : colors.border }]} onPress={() => setSelectedFunctionId(active ? null : fn.id)}>
                  <Text style={[s.filterText, { color: active ? "#fff" : colors.mutedForeground }]} numberOfLines={1}>
                    {fn.room} ({fnDone}/{fnItems.length})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={s.viewToggle}>
          <Pressable style={[s.toggleBtn, viewMode === "by-team" && { backgroundColor: colors.primary }]} onPress={() => setViewMode("by-team")}>
            <Text style={[s.toggleBtnText, { color: viewMode === "by-team" ? "#fff" : colors.mutedForeground }]}>By Team</Text>
          </Pressable>
          <Pressable style={[s.toggleBtn, viewMode === "by-event" && { backgroundColor: colors.primary }]} onPress={() => setViewMode("by-event")}>
            <Text style={[s.toggleBtnText, { color: viewMode === "by-event" ? "#fff" : colors.mutedForeground }]}>By Event</Text>
          </Pressable>
        </View>

        {viewMode === "by-team" && (
          <>
            {TEAM_ORDER.map((team) => {
              const items = byTeam[team];
              if (!items || items.length === 0) return null;
              const done = items.filter((i) => i.completed).length;
              const tc = getTeamColor(team);
              const icon = getTeamIcon(team) as any;
              return (
                <View key={team} style={s.teamSection}>
                  <View style={s.teamHeader}>
                    <View style={[s.teamStripe, { backgroundColor: tc }]} />
                    <View style={s.teamHeaderInfo}>
                      <Text style={[s.teamName, { color: tc }]}>{team}</Text>
                      <Text style={s.teamSubLabel}>{done === items.length ? "All done ✓" : `${items.length - done} task${items.length - done > 1 ? "s" : ""} remaining`}</Text>
                    </View>
                    <View style={[s.teamBadge, { backgroundColor: done === items.length ? colors.accent + "20" : tc + "20" }]}>
                      <Text style={[s.teamBadgeText, { color: done === items.length ? colors.accent : tc }]}>{done}/{items.length}</Text>
                    </View>
                  </View>
                  {items.map((item) => renderItem(item, false, !selectedFunctionId))}
                </View>
              );
            })}
          </>
        )}

        {viewMode === "by-event" && (
          <>
            {byEvent.map(({ fn, teamMap }) => {
              const fnItems = filteredItems.filter((p) => p.functionId === fn.id);
              const fnDone = fnItems.filter((p) => p.completed).length;
              return (
                <View key={fn.id} style={s.eventBlock}>
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
                    return (
                      <View key={team}>
                        <View style={s.subTeamHeader}>
                          <View style={[s.subTeamDot, { backgroundColor: tc }]} />
                          <Text style={[s.subTeamLabel, { color: tc }]}>{team}</Text>
                          <Text style={s.subTeamCount}>{done}/{items.length}</Text>
                        </View>
                        {items.map((item) => renderItem(item, false, false))}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
