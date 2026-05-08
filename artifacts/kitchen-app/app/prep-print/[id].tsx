import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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

// ── Constants ────────────────────────────────────────────────────────────────

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
    case "Hot Kitchen":   return "Hot mains, sauces, firing & cooking";
    case "Pastry":        return "Desserts, pastry & baked goods";
    case "Function Team": return "Room setup, food assembly & service running";
    default:              return "";
  }
}

function getCategoryStyle(category: string): {
  color: string; bgColor: string; label: string; borderLeft: string;
} {
  switch (category) {
    case "setup":   return { color: "#92400E", bgColor: "#FFFBEB", label: "PREP",    borderLeft: "#F59E0B" };
    case "venue":   return { color: "#1E3A8A", bgColor: "#EFF6FF", label: "VENUE",   borderLeft: "#3B82F6" };
    case "brief":   return { color: "#4C1D95", bgColor: "#F5F3FF", label: "BRIEF",   borderLeft: "#8B5CF6" };
    case "service": return { color: "#7C2D12", bgColor: "#FFF7ED", label: "SERVICE", borderLeft: "#F97316" };
    case "close":   return { color: "#14532D", bgColor: "#F0FDF4", label: "CLOSE",   borderLeft: "#22C55E" };
    default:        return { color: "#475569", bgColor: "#F8FAFC", label: "",        borderLeft: "#94A3B8" };
  }
}

function getDietaryColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gluten"))     return "#166534";
  if (n.includes("vegan"))      return "#365314";
  if (n.includes("vegetarian")) return "#166534";
  if (n.includes("nut"))        return "#92400E";
  if (n.includes("dairy"))      return "#1E40AF";
  if (n.includes("shellfish") || n.includes("seafood")) return "#9A3412";
  if (n.includes("halal"))      return "#0F766E";
  if (n.includes("kosher"))     return "#6D28D9";
  return "#475569";
}

function getDietaryBg(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gluten"))     return "#DCFCE7";
  if (n.includes("vegan"))      return "#ECFCCB";
  if (n.includes("vegetarian")) return "#DCFCE7";
  if (n.includes("nut"))        return "#FEF3C7";
  if (n.includes("dairy"))      return "#DBEAFE";
  if (n.includes("shellfish") || n.includes("seafood")) return "#FFEDD5";
  if (n.includes("halal"))      return "#CCFBF1";
  if (n.includes("kosher"))     return "#EDE9FE";
  return "#F1F5F9";
}

// ── Component ────────────────────────────────────────────────────────────────

type Section = "both" | "runsheet" | "prep";

export default function PrepPrintScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, prepItems, staff } = useKitchen();
  const [section, setSection] = useState<Section>("both");

  const fn = functions.find((f) => f.id === id);
  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const printedAt = new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });

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
  const teamsWithItems = TEAM_ORDER.filter((t) => (byTeam[t]?.length ?? 0) > 0);

  const prepDone  = fnPrep.filter((i) => i.completed).length;
  const tasksDone = fn.timeline.filter((t) => t.completed).length;

  const dietaryReqs = fn.dietaryRequirements ?? [];
  const totalDietary = dietaryReqs.reduce((s, d) => s + d.count, 0);
  const hasSevere    = dietaryReqs.some(
    (d) => d.name.toLowerCase().includes("nut") || d.name.toLowerCase().includes("shellfish")
  );

  function getLeader(team: PrepTeam) { return staff.find((s) => s.teamLeadFor === team) ?? null; }
  function getMembers(team: PrepTeam) { return staff.filter((s) => s.section === team && !s.teamLeadFor); }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Group timeline by category order
  const CAT_ORDER = ["setup", "venue", "brief", "service", "close"];
  const timelineGrouped = CAT_ORDER.map((cat) => ({
    cat,
    items: fn.timeline.filter((t) => (t.category ?? "setup") === cat),
  })).filter((g) => g.items.length > 0);

  // ── Share text ────────────────────────────────────────────────────────────
  async function handleShare() {
    const lines: string[] = [
      "══════════════════════════════════════",
      "KITCHENCOMMAND — FULL FUNCTION SHEET",
      "══════════════════════════════════════",
      fn.name.toUpperCase(),
      `Room: ${fn.room}  |  ${fn.floor}`,
      `Service: ${fn.startTime} – ${fn.endTime}  |  ${fn.guestCount} guests  |  ${fn.functionType}`,
      `Printed: ${today}, ${printedAt}`,
      "",
    ];

    if (dietaryReqs.length > 0) {
      lines.push("⚠ DIETARY REQUIREMENTS ⚠");
      dietaryReqs.forEach((d) => {
        lines.push(`  ${d.count} × ${d.name}${d.note ? ` — ${d.note}` : ""}`);
      });
      lines.push("");
    }

    if (section !== "prep") {
      lines.push("────────────────────────────────");
      lines.push("SERVICE RUN SHEET");
      lines.push("────────────────────────────────");
      fn.timeline.forEach((t) => {
        const cat = getCategoryStyle(t.category ?? "setup");
        const done = t.completed ? "✓" : "○";
        lines.push(`${done} ${t.time}  [${cat.label}]  ${t.task}`);
      });
      lines.push("");
    }

    if (section !== "runsheet") {
      lines.push("────────────────────────────────");
      lines.push("PREP LIST");
      lines.push("────────────────────────────────");
      TEAM_ORDER.forEach((team) => {
        const items = byTeam[team];
        if (!items || items.length === 0) return;
        const leader = getLeader(team);
        lines.push(`\n═ ${team.toUpperCase()} ═`);
        if (leader) lines.push(`  Team Leader: ${leader.name} (${leader.role})`);
        items.forEach((item) => {
          const done = item.completed ? "[✓]" : "[ ]";
          lines.push(`${done} ${item.dish}`);
          lines.push(`    Qty: ${item.quantity}  |  Ready by: ${item.deadline}`);
          if (item.note) lines.push(`    ${item.note}`);
        });
      });
    }

    lines.push("", "KitchenCommand");
    try {
      await Share.share({ message: lines.join("\n"), title: `Function Sheet — ${fn.name}` });
    } catch {}
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const s = StyleSheet.create({
    root:           { flex: 1, backgroundColor: "#F1F5F9" },
    toolbar:        { flexDirection: "row", alignItems: "center", paddingTop: topPad + 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#1E293B", gap: 8 },
    backBtn:        { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    toolbarTitle:   { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
    shareBtn:       { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F97316", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    shareBtnText:   { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },

    // Section toggle
    toggleBar:      { flexDirection: "row", margin: 14, marginBottom: 4, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#fff", overflow: "hidden" },
    toggleBtn:      { flex: 1, paddingVertical: 9, alignItems: "center" },
    toggleBtnText:  { fontSize: 12, fontFamily: "Inter_600SemiBold" },

    // Page wrapper (looks like a printed document)
    page:           { backgroundColor: "#fff", marginHorizontal: 14, marginBottom: 10, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#CBD5E1",
                      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },

    // Document header
    docHeader:      { backgroundColor: "#1E293B", paddingHorizontal: 18, paddingVertical: 16 },
    docKC:          { fontSize: 9, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
    docName:        { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 28, marginBottom: 10 },
    docChipsRow:    { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
    docChip:        { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    docChipText:    { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#E2E8F0" },
    docStatusRow:   { flexDirection: "row", gap: 8 },
    docStatusBox:   { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 6, padding: 8, alignItems: "center" },
    docStatusNum:   { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
    docStatusLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 },

    // Date bar
    dateBar:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#F8FAFC", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
    dateText:       { fontSize: 11, fontFamily: "Inter_500Medium", color: "#64748B" },
    printNote:      { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94A3B8" },

    // Section divider
    sectionDivider: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderTopWidth: 1, borderColor: "#E2E8F0", gap: 8 },
    sectionDividerText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2, textTransform: "uppercase" },
    sectionCount:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    sectionCountText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    // Dietary
    dietarySection: { borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
    severeWarning:  { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#FEF2F2", borderBottomWidth: 1, borderBottomColor: "#FECACA" },
    severeText:     { flex: 1, fontSize: 12, fontFamily: "Inter_700Bold", color: "#DC2626", lineHeight: 18 },
    dietaryGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 14 },
    dietaryBadge:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
    dietaryCount:   { fontSize: 18, fontFamily: "Inter_700Bold" },
    dietaryName:    { fontSize: 12, fontFamily: "Inter_700Bold", lineHeight: 16 },
    dietaryNote:    { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1, opacity: 0.8 },

    // Run sheet
    runSheetSection: { borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
    catGroup:        { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    catHeader:       { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    catLabel:        { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2, textTransform: "uppercase", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
    catCount:        { fontSize: 10, fontFamily: "Inter_500Medium", color: "#94A3B8" },
    timelineRow:     { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F8FAFC", gap: 10 },
    timelineTime:    { width: 44, fontSize: 13, fontFamily: "Inter_700Bold", color: "#1E293B", paddingTop: 1 },
    timelineCheck:   { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: "#CBD5E1", backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
    timelineCheckDone: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
    timelineTask:    { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#334155", lineHeight: 20 },
    timelineTaskDone: { color: "#94A3B8", textDecorationLine: "line-through" },
    timelineService: { fontFamily: "Inter_700Bold", color: "#1E293B" },

    // Prep list
    prepSection:    { },
    teamBlock:      { borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
    teamTitleRow:   { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
    teamColorBar:   { width: 4, height: 36, borderRadius: 2 },
    teamInfo:       { flex: 1 },
    teamName:       { fontSize: 14, fontFamily: "Inter_700Bold" },
    teamDesc:       { fontSize: 10, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 1 },
    teamBadge:      { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
    teamBadgeText:  { fontSize: 11, fontFamily: "Inter_700Bold" },
    leaderRow:      { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
    leaderAvatar:   { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    leaderAvatarTxt: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
    leaderInfo:     { flex: 1 },
    leaderRole:     { fontSize: 9, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8 },
    leaderName:     { fontSize: 12, fontFamily: "Inter_700Bold", color: "#1E293B", marginTop: 1 },
    leaderShift:    { fontSize: 10, fontFamily: "Inter_400Regular" },
    membersRow:     { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F8FAFC" },
    membersLabel:   { fontSize: 9, fontFamily: "Inter_700Bold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 },
    memberTag:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
    memberTagText:  { fontSize: 11, fontFamily: "Inter_500Medium" },
    prepItemRow:    { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#F8FAFC", gap: 10 },
    checkbox:       { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: "#CBD5E1", backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 },
    checkboxDone:   { backgroundColor: "#22C55E", borderColor: "#22C55E" },
    itemContent:    { flex: 1 },
    itemTopRow:     { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 2 },
    dishName:       { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold", color: "#1E293B" },
    dishDone:       { color: "#94A3B8", textDecorationLine: "line-through" },
    deadlineBox:    { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", alignItems: "center" },
    deadlineBoxDone: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
    deadlineLabel:  { fontSize: 7, fontFamily: "Inter_700Bold", color: "#94A3B8", letterSpacing: 0.5 },
    deadlineTime:   { fontSize: 13, fontFamily: "Inter_700Bold", color: "#DC2626" },
    deadlineTimeDone: { color: "#22C55E" },
    prevDayBadge:   { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "#EDE9FE", borderWidth: 1, borderColor: "#DDD6FE", alignSelf: "flex-start", marginBottom: 3 },
    prevDayText:    { fontSize: 9, fontFamily: "Inter_700Bold", color: "#7C3AED" },
    quantity:       { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#EA580C", marginBottom: 2 },
    noteText:       { fontSize: 11, fontFamily: "Inter_400Regular", color: "#475569", lineHeight: 17 },

    // Footer
    footer:         { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14, backgroundColor: "#F8FAFC", borderTopWidth: 1, borderTopColor: "#E2E8F0", gap: 16 },
    footerLeft:     { flex: 1 },
    footerText:     { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94A3B8", lineHeight: 16 },
    signOffBlock:   { alignItems: "flex-end", gap: 4 },
    signOffLabel:   { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    signOffLine:    { width: 130, height: 1, backgroundColor: "#CBD5E1", marginTop: 16 },

    bottomPad:      { height: Platform.OS === "web" ? 40 : insets.bottom + 24 },
  });

  // ── Render helpers ─────────────────────────────────────────────────────────

  function renderDietary() {
    if (dietaryReqs.length === 0) return null;
    return (
      <View style={s.dietarySection}>
        <View style={[s.sectionDivider, { backgroundColor: hasSevere ? "#FEF2F2" : "#FFFBEB", borderColor: hasSevere ? "#FECACA" : "#FDE68A" }]}>
          <Ionicons name="warning" size={14} color={hasSevere ? "#DC2626" : "#D97706"} />
          <Text style={[s.sectionDividerText, { color: hasSevere ? "#DC2626" : "#D97706", flex: 1 }]}>
            Dietary Requirements
          </Text>
          <View style={[s.sectionCount, { backgroundColor: hasSevere ? "#FEE2E2" : "#FEF3C7" }]}>
            <Text style={[s.sectionCountText, { color: hasSevere ? "#DC2626" : "#D97706" }]}>
              {totalDietary} guests
            </Text>
          </View>
        </View>
        {hasSevere && (
          <View style={s.severeWarning}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={s.severeText}>
              SEVERE ALLERGEN ON THIS FUNCTION — Confirm alternates before service. Epinephrine on site.
            </Text>
          </View>
        )}
        <View style={s.dietaryGrid}>
          {dietaryReqs.map((req, idx) => {
            const dc = getDietaryColor(req.name);
            const bg = getDietaryBg(req.name);
            return (
              <View key={idx} style={[s.dietaryBadge, { backgroundColor: bg, borderColor: dc + "50" }]}>
                <Text style={[s.dietaryCount, { color: dc }]}>{req.count}</Text>
                <View>
                  <Text style={[s.dietaryName, { color: dc }]}>{req.name}</Text>
                  {req.note ? <Text style={[s.dietaryNote, { color: dc }]}>{req.note}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  function renderRunSheet() {
    return (
      <View style={s.runSheetSection}>
        <View style={[s.sectionDivider, { backgroundColor: "#F8FAFC" }]}>
          <Feather name="clock" size={13} color="#1E293B" />
          <Text style={[s.sectionDividerText, { color: "#1E293B", flex: 1 }]}>Service Run Sheet</Text>
          <View style={[s.sectionCount, { backgroundColor: "#E2E8F0" }]}>
            <Text style={[s.sectionCountText, { color: "#475569" }]}>
              {tasksDone}/{fn.timeline.length} done
            </Text>
          </View>
        </View>
        {timelineGrouped.map(({ cat, items }) => {
          const cs = getCategoryStyle(cat);
          const catDone = items.filter((i) => i.completed).length;
          return (
            <View key={cat} style={[s.catGroup, { borderLeftWidth: 4, borderLeftColor: cs.borderLeft }]}>
              <View style={[s.catHeader, { backgroundColor: cs.bgColor }]}>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: cs.borderLeft + "30" }}>
                  <Text style={[s.catLabel, { color: cs.color }]}>{cs.label}</Text>
                </View>
                <Text style={s.catCount}>{catDone}/{items.length} complete</Text>
              </View>
              {items.map((item) => (
                <View key={item.id} style={[s.timelineRow, { backgroundColor: item.completed ? "#F8FAFC" : "#fff" }]}>
                  <Text style={s.timelineTime}>{item.time}</Text>
                  <View style={[s.timelineCheck, item.completed && s.timelineCheckDone]}>
                    {item.completed && <Feather name="check" size={12} color="#fff" />}
                  </View>
                  <Text style={[
                    s.timelineTask,
                    item.completed && s.timelineTaskDone,
                    cat === "service" && !item.completed && s.timelineService,
                  ]}>
                    {item.task}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  }

  function renderPrepList() {
    return (
      <View style={s.prepSection}>
        <View style={[s.sectionDivider, { backgroundColor: "#F8FAFC" }]}>
          <Feather name="list" size={13} color="#1E293B" />
          <Text style={[s.sectionDividerText, { color: "#1E293B", flex: 1 }]}>Prep List</Text>
          <View style={[s.sectionCount, { backgroundColor: "#E2E8F0" }]}>
            <Text style={[s.sectionCountText, { color: "#475569" }]}>
              {prepDone}/{fnPrep.length} done
            </Text>
          </View>
        </View>
        {teamsWithItems.length === 0 && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: "#94A3B8" }}>No prep items for this event</Text>
          </View>
        )}
        {teamsWithItems.map((team) => {
          const items = byTeam[team]!;
          const done  = items.filter((i) => i.completed).length;
          const allDone = done === items.length;
          const tc    = getTeamColor(team);
          const leader  = getLeader(team);
          const members = getMembers(team);
          return (
            <View key={team} style={s.teamBlock}>
              <View style={[s.teamTitleRow, { backgroundColor: tc + "0A" }]}>
                <View style={[s.teamColorBar, { backgroundColor: tc }]} />
                <View style={s.teamInfo}>
                  <Text style={[s.teamName, { color: tc }]}>{team}</Text>
                  <Text style={s.teamDesc}>{getTeamDescription(team)}</Text>
                </View>
                <View style={[s.teamBadge, { backgroundColor: allDone ? "#F0FDF4" : "#FEF2F2" }]}>
                  <Text style={[s.teamBadgeText, { color: allDone ? "#16A34A" : "#DC2626" }]}>
                    {done}/{items.length}
                  </Text>
                </View>
              </View>

              {leader && (
                <View style={[s.leaderRow, { backgroundColor: tc + "07", borderTopColor: tc + "25" }]}>
                  <View style={[s.leaderAvatar, { backgroundColor: tc }]}>
                    <Text style={s.leaderAvatarTxt}>
                      {leader.name.split(" ").map((n) => n[0]).join("")}
                    </Text>
                  </View>
                  <View style={s.leaderInfo}>
                    <Text style={[s.leaderRole, { color: tc }]}>Team Leader</Text>
                    <Text style={s.leaderName}>{leader.name}</Text>
                    <Text style={[s.leaderShift, { color: tc }]}>
                      {leader.role} · {leader.shiftStart}–{leader.shiftEnd}
                    </Text>
                  </View>
                  <Ionicons name="shield-checkmark" size={18} color={tc} />
                </View>
              )}

              {members.length > 0 && (
                <View style={[s.membersRow, { borderTopColor: tc + "20" }]}>
                  <Text style={s.membersLabel}>Team:</Text>
                  {members.map((m) => (
                    <View key={m.id} style={[s.memberTag, { backgroundColor: tc + "12", borderColor: tc + "35" }]}>
                      <Text style={[s.memberTagText, { color: tc }]}>{m.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {items.map((item) => (
                <View key={item.id} style={s.prepItemRow}>
                  <View style={[s.checkbox, item.completed && s.checkboxDone]}>
                    {item.completed && <Feather name="check" size={11} color="#fff" />}
                  </View>
                  <View style={s.itemContent}>
                    <View style={s.itemTopRow}>
                      <Text style={[s.dishName, item.completed && s.dishDone]}>{item.dish}</Text>
                      <View style={[s.deadlineBox, item.completed && s.deadlineBoxDone]}>
                        <Text style={s.deadlineLabel}>READY BY</Text>
                        <Text style={[s.deadlineTime, item.completed && s.deadlineTimeDone]}>
                          {item.completed ? "Done ✓" : item.deadline}
                        </Text>
                      </View>
                    </View>
                    {item.prepDay === "day-before" && (
                      <View style={s.prevDayBadge}>
                        <Ionicons name="moon" size={9} color="#7C3AED" />
                        <Text style={s.prevDayText}>PREPARED PREVIOUS DAY</Text>
                      </View>
                    )}
                    <Text style={s.quantity}>{item.quantity}</Text>
                    {item.note ? <Text style={s.noteText}>{item.note}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* Toolbar */}
      <View style={s.toolbar}>
        <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={17} color="#fff" />
        </Pressable>
        <Text style={s.toolbarTitle} numberOfLines={1}>Full Sheet — {fn.name}</Text>
        <Pressable style={({ pressed }) => [s.shareBtn, pressed && { opacity: 0.8 }]} onPress={handleShare}>
          <Feather name="share" size={14} color="#fff" />
          <Text style={s.shareBtnText}>Share</Text>
        </Pressable>
      </View>

      {/* Section filter toggle */}
      <View style={s.toggleBar}>
        {(["both", "runsheet", "prep"] as Section[]).map((opt) => {
          const labels: Record<Section, string> = { both: "Full Sheet", runsheet: "Run Sheet Only", prep: "Prep Only" };
          const active = section === opt;
          return (
            <Pressable
              key={opt}
              style={[s.toggleBtn, active && { backgroundColor: "#1E293B" }]}
              onPress={() => setSection(opt)}
            >
              <Text style={[s.toggleBtnText, { color: active ? "#fff" : "#64748B" }]}>
                {labels[opt]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.page}>

          {/* ── Document header ──────────────────────────────────────────── */}
          <View style={s.docHeader}>
            <Text style={s.docKC}>KitchenCommand · Full Function Sheet</Text>
            <Text style={s.docName}>{fn.name}</Text>
            <View style={s.docChipsRow}>
              <View style={s.docChip}>
                <Feather name="map-pin" size={11} color="#E2E8F0" />
                <Text style={s.docChipText}>{fn.room}</Text>
              </View>
              <View style={s.docChip}>
                <Feather name="layers" size={11} color="#E2E8F0" />
                <Text style={s.docChipText}>{fn.floor}</Text>
              </View>
              <View style={s.docChip}>
                <Feather name="clock" size={11} color="#E2E8F0" />
                <Text style={s.docChipText}>{fn.startTime} – {fn.endTime}</Text>
              </View>
              <View style={s.docChip}>
                <Ionicons name="people" size={11} color="#E2E8F0" />
                <Text style={s.docChipText}>{fn.guestCount} guests</Text>
              </View>
              <View style={s.docChip}>
                <Feather name="tag" size={11} color="#E2E8F0" />
                <Text style={s.docChipText}>{fn.functionType}</Text>
              </View>
            </View>
            <View style={s.docStatusRow}>
              <View style={s.docStatusBox}>
                <Text style={s.docStatusNum}>{prepDone}/{fnPrep.length}</Text>
                <Text style={s.docStatusLabel}>Food Ready</Text>
              </View>
              <View style={s.docStatusBox}>
                <Text style={s.docStatusNum}>{tasksDone}/{fn.timeline.length}</Text>
                <Text style={s.docStatusLabel}>Tasks Done</Text>
              </View>
              {totalDietary > 0 && (
                <View style={[s.docStatusBox, hasSevere && { backgroundColor: "rgba(239,68,68,0.2)" }]}>
                  <Text style={[s.docStatusNum, hasSevere && { color: "#FCA5A5" }]}>{totalDietary}</Text>
                  <Text style={[s.docStatusLabel, hasSevere && { color: "#FCA5A5" }]}>Dietary</Text>
                </View>
              )}
            </View>
          </View>

          {/* Date bar */}
          <View style={s.dateBar}>
            <Text style={s.dateText}>Printed: {today} at {printedAt}</Text>
            <Text style={s.printNote}>Screenshot or Share to send</Text>
          </View>

          {/* ── Dietary (always shown if present) ───────────────────────── */}
          {renderDietary()}

          {/* ── Run Sheet ────────────────────────────────────────────────── */}
          {(section === "both" || section === "runsheet") && renderRunSheet()}

          {/* ── Divider between sections (when showing both) ─────────────── */}
          {section === "both" && fn.timeline.length > 0 && fnPrep.length > 0 && (
            <View style={{ height: 1, backgroundColor: "#CBD5E1", marginVertical: 0 }} />
          )}

          {/* ── Prep List ────────────────────────────────────────────────── */}
          {(section === "both" || section === "prep") && renderPrepList()}

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <View style={s.footer}>
            <View style={s.footerLeft}>
              <Text style={s.footerText}>KitchenCommand · {today}</Text>
              <Text style={s.footerText}>{fn.name} · {fn.room} · {fn.guestCount} covers</Text>
              {totalDietary > 0 && (
                <Text style={[s.footerText, { color: hasSevere ? "#DC2626" : "#D97706", fontFamily: "Inter_700Bold", marginTop: 3 }]}>
                  {hasSevere ? "⚠ SEVERE ALLERGEN — check dietary notes" : `${totalDietary} dietary guests — see requirements above`}
                </Text>
              )}
            </View>
            <View style={s.signOffBlock}>
              <Text style={s.signOffLabel}>Head Chef sign-off</Text>
              <View style={s.signOffLine} />
            </View>
          </View>

        </View>

        {/* Team colour key */}
        {(section === "both" || section === "prep") && (
          <View style={{ marginHorizontal: 14, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
              Team Colour Key
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {TEAM_ORDER.map((team) => {
                const tc = getTeamColor(team);
                return (
                  <View key={team} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, backgroundColor: tc + "12", borderWidth: 1, borderColor: tc + "40" }}>
                    <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: tc }} />
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: tc }}>{team}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
