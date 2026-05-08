import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrepTeam, useKitchen } from "@/context/KitchenContext";

const TEAM_ORDER: PrepTeam[] = ["Cold Larder", "Butchery", "Hot Kitchen", "Pastry", "Catering"];

function getTeamColor(team: PrepTeam): string {
  switch (team) {
    case "Cold Larder": return "#0D9488";
    case "Butchery":    return "#EA580C";
    case "Hot Kitchen": return "#DC2626";
    case "Pastry":      return "#7C3AED";
    case "Catering":    return "#2563EB";
    default:            return "#64748B";
  }
}

export default function PrepPrintScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, prepItems } = useKitchen();

  const fn = functions.find((f) => f.id === id);
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (!fn) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#111", fontFamily: "Inter_600SemiBold" }}>Event not found</Text>
      </View>
    );
  }

  const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
  const byTeam: Partial<Record<PrepTeam, typeof fnPrep>> = {};
  fnPrep.forEach((item) => {
    if (!byTeam[item.team]) byTeam[item.team] = [];
    byTeam[item.team]!.push(item);
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    toolbar: {
      flexDirection: "row", alignItems: "center",
      paddingTop: topPad + 8, paddingHorizontal: 16, paddingBottom: 12,
      backgroundColor: "#1E293B", gap: 10,
    },
    backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    toolbarTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
    shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F97316", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    shareBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    page: { backgroundColor: "#fff", margin: 16, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0" },
    pageHeader: { backgroundColor: "#1E293B", padding: 20 },
    runSheetLabel: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#94A3B8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
    fnName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 28, marginBottom: 12 },
    headerInfoRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    headerChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    headerChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#E2E8F0" },
    dateBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E2E8F0", backgroundColor: "#F1F5F9" },
    dateText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B" },
    printNote: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    teamSection: { borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
    teamHeader: {
      flexDirection: "row", alignItems: "center", gap: 10,
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: "#E2E8F0",
    },
    teamColorBlock: { width: 6, height: 36, borderRadius: 3 },
    teamHeaderInfo: { flex: 1 },
    teamName: { fontSize: 15, fontFamily: "Inter_700Bold" },
    teamCount: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 2 },
    teamStatusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
    teamStatusText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    itemRow: {
      flexDirection: "row", alignItems: "flex-start",
      paddingHorizontal: 16, paddingVertical: 14,
      borderTopWidth: 1, borderTopColor: "#F1F5F9",
      gap: 12,
    },
    checkbox: {
      width: 22, height: 22, borderRadius: 5,
      borderWidth: 1.5, borderColor: "#CBD5E1",
      backgroundColor: "#fff", marginTop: 2,
      alignItems: "center", justifyContent: "center",
    },
    checkboxDone: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
    itemContent: { flex: 1 },
    itemTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 3 },
    dishName: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold", color: "#1E293B" },
    dishNameDone: { color: "#94A3B8", textDecorationLine: "line-through" },
    deadlineBox: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", flexDirection: "row", alignItems: "center", gap: 4 },
    deadlineBoxDone: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
    deadlineLabel: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 0.5 },
    deadlineTime: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#DC2626" },
    deadlineTimeDone: { color: "#22C55E" },
    badgeRow: { flexDirection: "row", gap: 6, marginBottom: 5, flexWrap: "wrap" },
    prevDayBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "#EDE9FE", borderWidth: 1, borderColor: "#DDD6FE" },
    prevDayText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#7C3AED" },
    quantity: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#EA580C", marginBottom: 3 },
    note: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#475569", lineHeight: 17 },
    pageFooter: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 12,
      backgroundColor: "#F8FAFC", borderTopWidth: 1, borderTopColor: "#E2E8F0",
    },
    footerText: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    sigBox: { alignItems: "flex-end" },
    sigLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    sigLine: { width: 120, height: 1, backgroundColor: "#CBD5E1", marginTop: 16 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 24 },
    legendSection: { margin: 16, marginTop: 0 },
    legendTitle: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 },
    legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  });

  async function handleShare() {
    const lines: string[] = [];
    lines.push(`FUNCTION PREP RUN SHEET`);
    lines.push(`${fn.name.toUpperCase()}`);
    lines.push(`Room: ${fn.room} | Start: ${fn.startTime} | Guests: ${fn.guestCount}`);
    lines.push(`Date: ${today}`);
    lines.push("");
    TEAM_ORDER.forEach((team) => {
      const items = byTeam[team];
      if (!items || items.length === 0) return;
      lines.push(`--- ${team.toUpperCase()} ---`);
      items.forEach((item) => {
        lines.push(`[ ] ${item.dish}`);
        lines.push(`    Qty: ${item.quantity}`);
        lines.push(`    Ready by: ${item.deadline}${item.prepDay === "day-before" ? " (PREV DAY)" : ""}`);
        lines.push(`    ${item.note}`);
        lines.push("");
      });
    });
    try {
      await Share.share({ message: lines.join("\n"), title: `Prep Sheet — ${fn.name}` });
    } catch {}
  }

  return (
    <View style={s.root}>
      <View style={s.toolbar}>
        <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={17} color="#fff" />
        </Pressable>
        <Text style={s.toolbarTitle}>Prep Run Sheet</Text>
        <Pressable style={({ pressed }) => [s.shareBtn, pressed && { opacity: 0.8 }]} onPress={handleShare}>
          <Feather name="share" size={14} color="#fff" />
          <Text style={s.shareBtnText}>Share</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.page}>
          <View style={s.pageHeader}>
            <Text style={s.runSheetLabel}>Function Prep Run Sheet</Text>
            <Text style={s.fnName}>{fn.name}</Text>
            <View style={s.headerInfoRow}>
              <View style={s.headerChip}>
                <Feather name="map-pin" size={12} color="#E2E8F0" />
                <Text style={s.headerChipText}>{fn.room}</Text>
              </View>
              <View style={s.headerChip}>
                <Feather name="clock" size={12} color="#E2E8F0" />
                <Text style={s.headerChipText}>Start {fn.startTime}</Text>
              </View>
              <View style={s.headerChip}>
                <Ionicons name="people" size={12} color="#E2E8F0" />
                <Text style={s.headerChipText}>{fn.guestCount} guests</Text>
              </View>
              <View style={s.headerChip}>
                <Feather name="tag" size={12} color="#E2E8F0" />
                <Text style={s.headerChipText}>{fn.functionType}</Text>
              </View>
            </View>
          </View>

          <View style={s.dateBar}>
            <Text style={s.dateText}>{today}</Text>
            <Text style={s.printNote}>Screenshot or share to print</Text>
          </View>

          {TEAM_ORDER.map((team) => {
            const items = byTeam[team];
            if (!items || items.length === 0) return null;
            const done = items.filter((i) => i.completed).length;
            const tc = getTeamColor(team);
            const allDone = done === items.length;

            return (
              <View key={team} style={s.teamSection}>
                <View style={s.teamHeader}>
                  <View style={[s.teamColorBlock, { backgroundColor: tc }]} />
                  <View style={s.teamHeaderInfo}>
                    <Text style={[s.teamName, { color: tc }]}>{team}</Text>
                    <Text style={s.teamCount}>{items.length} task{items.length > 1 ? "s" : ""}</Text>
                  </View>
                  <View style={[s.teamStatusPill, { backgroundColor: allDone ? "#F0FDF4" : "#FEF2F2" }]}>
                    <Text style={[s.teamStatusText, { color: allDone ? "#22C55E" : "#DC2626" }]}>
                      {done}/{items.length} done
                    </Text>
                  </View>
                </View>

                {items.map((item) => (
                  <View key={item.id} style={s.itemRow}>
                    <View style={[s.checkbox, item.completed && s.checkboxDone]}>
                      {item.completed && <Feather name="check" size={13} color="#fff" />}
                    </View>
                    <View style={s.itemContent}>
                      <View style={s.itemTopRow}>
                        <Text style={[s.dishName, item.completed && s.dishNameDone]}>{item.dish}</Text>
                        <View style={[s.deadlineBox, item.completed && s.deadlineBoxDone]}>
                          <Feather name="clock" size={10} color={item.completed ? "#22C55E" : "#DC2626"} />
                          <View>
                            <Text style={s.deadlineLabel}>READY BY</Text>
                            <Text style={[s.deadlineTime, item.completed && s.deadlineTimeDone]}>{item.completed ? "Done" : item.deadline}</Text>
                          </View>
                        </View>
                      </View>
                      {item.prepDay === "day-before" && (
                        <View style={s.badgeRow}>
                          <View style={s.prevDayBadge}>
                            <Ionicons name="moon" size={9} color="#7C3AED" />
                            <Text style={s.prevDayText}>PREPARED PREVIOUS DAY</Text>
                          </View>
                        </View>
                      )}
                      <Text style={s.quantity}>{item.quantity}</Text>
                      <Text style={s.note}>{item.note}</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

          <View style={s.pageFooter}>
            <View>
              <Text style={s.footerText}>KitchenCommand — Generated {today}</Text>
              <Text style={s.footerText}>{fn.name} · {fn.room} · {fn.guestCount} covers</Text>
            </View>
            <View style={s.sigBox}>
              <Text style={s.sigLabel}>Checked by</Text>
              <View style={s.sigLine} />
            </View>
          </View>
        </View>

        <View style={s.legendSection}>
          <Text style={s.legendTitle}>Team Colour Key</Text>
          <View style={s.legendRow}>
            {TEAM_ORDER.map((team) => {
              const tc = getTeamColor(team);
              return (
                <View key={team} style={[s.legendItem, { backgroundColor: tc + "15", borderColor: tc + "40" }]}>
                  <View style={[s.legendDot, { backgroundColor: tc }]} />
                  <Text style={[s.legendText, { color: tc }]}>{team}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
