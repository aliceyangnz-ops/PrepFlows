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

const TEAM_ORDER: PrepTeam[] = ["Cold Larder", "Butchery", "Hot Kitchen", "Pastry", "Function Team"];

function getTeamColor(team: PrepTeam): string {
  switch (team) {
    case "Cold Larder":   return "#0D9488";
    case "Butchery":      return "#EA580C";
    case "Hot Kitchen":   return "#DC2626";
    case "Pastry":        return "#7C3AED";
    case "Function Team": return "#2563EB";
    default:              return "#64748B";
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

export default function PrepPrintScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, prepItems, staff } = useKitchen();

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

  function getLeader(team: PrepTeam) {
    return staff.find((s) => s.teamLeadFor === team) ?? null;
  }
  function getMembers(team: PrepTeam) {
    return staff.filter((s) => s.section === team && !s.teamLeadFor);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F1F5F9" },
    toolbar: { flexDirection: "row", alignItems: "center", paddingTop: topPad + 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#1E293B", gap: 10 },
    backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    toolbarTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
    shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F97316", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    shareBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    page: { backgroundColor: "#fff", margin: 14, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0" },
    pageHeader: { backgroundColor: "#1E293B", padding: 18 },
    runSheetLabel: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#94A3B8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
    fnName: { fontSize: 21, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 27, marginBottom: 12 },
    headerInfoRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    headerChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    headerChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#E2E8F0" },
    dateBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E2E8F0", backgroundColor: "#F8FAFC" },
    dateText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B" },
    printNote: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    teamSection: { borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
    teamHeaderBlock: { borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
    teamTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
    teamColorBlock: { width: 5, height: 40, borderRadius: 3 },
    teamHeaderInfo: { flex: 1 },
    teamNameText: { fontSize: 15, fontFamily: "Inter_700Bold" },
    teamDescText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 1 },
    teamStatusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
    teamStatusText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    leaderRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
    leaderAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    leaderAvatarText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
    leaderTextGroup: { flex: 1 },
    leaderLabel: { fontSize: 9, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8 },
    leaderName: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1E293B", marginTop: 1 },
    leaderRole: { fontSize: 11, fontFamily: "Inter_400Regular" },
    membersRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F1F5F9", flexWrap: "wrap" },
    membersLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginRight: 2 },
    memberPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    memberPillText: { fontSize: 11, fontFamily: "Inter_500Medium" },
    itemRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: 1, borderTopColor: "#F1F5F9", gap: 12 },
    checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: "#CBD5E1", backgroundColor: "#fff", marginTop: 2, alignItems: "center", justifyContent: "center" },
    checkboxDone: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
    itemContent: { flex: 1 },
    itemTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 3 },
    dishName: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold", color: "#1E293B" },
    dishNameDone: { color: "#94A3B8", textDecorationLine: "line-through" },
    deadlineBox: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" },
    deadlineBoxDone: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
    deadlineLabel: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#94A3B8", letterSpacing: 0.5 },
    deadlineTime: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#DC2626" },
    deadlineTimeDone: { color: "#22C55E" },
    prevDayBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "#EDE9FE", borderWidth: 1, borderColor: "#DDD6FE", alignSelf: "flex-start", marginBottom: 4 },
    prevDayText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#7C3AED" },
    quantity: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#EA580C", marginBottom: 3 },
    note: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#475569", lineHeight: 17 },
    pageFooter: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#F8FAFC", borderTopWidth: 1, borderTopColor: "#E2E8F0" },
    footerText: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    sigBox: { alignItems: "flex-end" },
    sigLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    sigLine: { width: 120, height: 1, backgroundColor: "#CBD5E1", marginTop: 18 },
    legendSection: { margin: 14, marginTop: 0 },
    legendTitle: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 },
    legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, fontFamily: "Inter_500Medium" },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 24 },
  });

  async function handleShare() {
    const lines: string[] = [
      "FUNCTION PREP RUN SHEET",
      fn.name.toUpperCase(),
      `Room: ${fn.room}  |  Start: ${fn.startTime}  |  Guests: ${fn.guestCount}  |  Type: ${fn.functionType}`,
      `Date: ${today}`,
      "",
    ];
    TEAM_ORDER.forEach((team) => {
      const items = byTeam[team];
      if (!items || items.length === 0) return;
      const leader = getLeader(team);
      lines.push(`════ ${team.toUpperCase()} ════`);
      if (leader) lines.push(`Chef in Charge / Team Leader: ${leader.name} (${leader.role})`);
      lines.push("");
      items.forEach((item) => {
        const status = item.completed ? "[✓]" : "[ ]";
        lines.push(`${status} ${item.dish}`);
        lines.push(`    Qty: ${item.quantity}`);
        lines.push(`    Ready by: ${item.deadline}${item.prepDay === "day-before" ? " — PREPARED PREVIOUS DAY" : ""}`);
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
        <Text style={s.toolbarTitle}>Prep Run Sheet — {fn.room}</Text>
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
              <View style={s.headerChip}><Feather name="map-pin" size={12} color="#E2E8F0" /><Text style={s.headerChipText}>{fn.room}</Text></View>
              <View style={s.headerChip}><Feather name="clock" size={12} color="#E2E8F0" /><Text style={s.headerChipText}>Start {fn.startTime} – Finish {fn.endTime}</Text></View>
              <View style={s.headerChip}><Ionicons name="people" size={12} color="#E2E8F0" /><Text style={s.headerChipText}>{fn.guestCount} guests</Text></View>
              <View style={s.headerChip}><Feather name="tag" size={12} color="#E2E8F0" /><Text style={s.headerChipText}>{fn.functionType}</Text></View>
            </View>
          </View>

          <View style={s.dateBar}>
            <Text style={s.dateText}>{today}</Text>
            <Text style={s.printNote}>Screenshot or Share to print</Text>
          </View>

          {TEAM_ORDER.map((team) => {
            const items = byTeam[team];
            if (!items || items.length === 0) return null;
            const done = items.filter((i) => i.completed).length;
            const tc = getTeamColor(team);
            const allDone = done === items.length;
            const leader = getLeader(team);
            const members = getMembers(team);

            return (
              <View key={team} style={s.teamSection}>
                <View style={s.teamHeaderBlock}>
                  <View style={[s.teamTitleRow, { backgroundColor: tc + "10" }]}>
                    <View style={[s.teamColorBlock, { backgroundColor: tc }]} />
                    <View style={s.teamHeaderInfo}>
                      <Text style={[s.teamNameText, { color: tc }]}>{team}</Text>
                      <Text style={s.teamDescText}>{getTeamDescription(team)}</Text>
                    </View>
                    <View style={[s.teamStatusPill, { backgroundColor: allDone ? "#F0FDF4" : "#FEF2F2" }]}>
                      <Text style={[s.teamStatusText, { color: allDone ? "#22C55E" : "#DC2626" }]}>{done}/{items.length} done</Text>
                    </View>
                  </View>

                  {leader && (
                    <View style={[s.leaderRow, { borderTopColor: tc + "25", backgroundColor: tc + "06" }]}>
                      <View style={[s.leaderAvatar, { backgroundColor: tc }]}>
                        <Text style={s.leaderAvatarText}>{leader.name.split(" ").map((n) => n[0]).join("")}</Text>
                      </View>
                      <View style={s.leaderTextGroup}>
                        <Text style={[s.leaderLabel, { color: tc }]}>Chef in Charge / Team Leader</Text>
                        <Text style={s.leaderName}>{leader.name}</Text>
                        <Text style={[s.leaderRole, { color: tc }]}>{leader.role} · Shift {leader.shiftStart}–{leader.shiftEnd}</Text>
                      </View>
                      <Ionicons name="shield-checkmark" size={20} color={tc} />
                    </View>
                  )}

                  {members.length > 0 && (
                    <View style={[s.membersRow, { borderTopColor: tc + "20" }]}>
                      <Text style={s.membersLabel}>Team:</Text>
                      {members.map((m) => (
                        <View key={m.id} style={[s.memberPill, { backgroundColor: tc + "12", borderColor: tc + "35" }]}>
                          <Text style={[s.memberPillText, { color: tc }]}>{m.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {items.map((item) => (
                  <View key={item.id} style={s.itemRow}>
                    <View style={[s.checkbox, item.completed && s.checkboxDone]}>
                      {item.completed && <Feather name="check" size={12} color="#fff" />}
                    </View>
                    <View style={s.itemContent}>
                      <View style={s.itemTopRow}>
                        <Text style={[s.dishName, item.completed && s.dishNameDone]}>{item.dish}</Text>
                        <View style={[s.deadlineBox, item.completed && s.deadlineBoxDone]}>
                          <Text style={s.deadlineLabel}>READY BY</Text>
                          <Text style={[s.deadlineTime, item.completed && s.deadlineTimeDone]}>{item.completed ? "Done ✓" : item.deadline}</Text>
                        </View>
                      </View>
                      {item.prepDay === "day-before" && (
                        <View style={s.prevDayBadge}>
                          <Ionicons name="moon" size={9} color="#7C3AED" />
                          <Text style={s.prevDayText}>PREPARED PREVIOUS DAY</Text>
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
              <Text style={s.footerText}>KitchenCommand — {today}</Text>
              <Text style={s.footerText}>{fn.name} · {fn.room} · {fn.guestCount} covers</Text>
            </View>
            <View style={s.sigBox}>
              <Text style={s.sigLabel}>Head Chef sign-off</Text>
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
                <View key={team} style={[s.legendItem, { backgroundColor: tc + "12", borderColor: tc + "40" }]}>
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
