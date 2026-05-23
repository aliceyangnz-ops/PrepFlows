import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAccessLevel, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getWeekDays(): string[] {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const d = new Date().getDay();
  const adjusted = d === 0 ? 6 : d - 1;
  return days.map((label, i) => (i === adjusted ? label : label));
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { functions, prepItems, staff, sickStaffIds, currentStaffId } = useKitchen();

  const currentMember = staff.find((s) => s.id === currentStaffId) ?? null;
  const isManager = currentMember ? getAccessLevel(currentMember) === "manager" : false;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalGuests = useMemo(() => functions.reduce((n, f) => n + f.guestCount, 0), [functions]);
  const prepDone = useMemo(() => prepItems.filter((p) => p.completed).length, [prepItems]);
  const prepTotal = prepItems.length;
  const prepPct = prepTotal > 0 ? Math.round((prepDone / prepTotal) * 100) : 0;

  const onTimeCount = useMemo(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return functions.filter((f) => {
      const startMins = timeToMinutes(f.startTime);
      const endMins = timeToMinutes(f.endTime);
      return endMins <= nowMins;
    }).length;
  }, [functions]);

  const onTimeRate = functions.length > 0 ? Math.round((onTimeCount / functions.length) * 100) : 100;

  const today = new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
  const weekLabel = (() => {
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    const wk = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[now.getMonth()]} ${now.getFullYear()} · Week ${wk}`;
  })();

  const dayOfWeek = new Date().getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const chartDays = ["M", "T", "W", "T", "F", "S", "S"];
  const chartData = chartDays.map((d, i) => ({
    day: d,
    pct: i < todayIdx ? Math.floor(70 + Math.random() * 25) : i === todayIdx ? prepPct : 0,
    today: i === todayIdx,
  }));

  const incidents = useMemo(() => {
    const result = [];
    const nutCount = functions.reduce((n, f) => n + f.dietaryRequirements.filter((d) => d.name.toLowerCase().includes("nut")).reduce((s, d) => s + d.count, 0), 0);
    if (nutCount > 0) result.push({ emoji: "🥜", title: "Nut Allergy Checks", desc: `${nutCount} flagged across functions`, icon: "✓", iconColor: "#22C55E" });
    if (sickStaffIds.length > 0) result.push({ emoji: "🤒", title: "Staff Sick Calls", desc: `${sickStaffIds.length} staff called in sick`, icon: "⚠", iconColor: "#EAB308" });
    const overdue = prepItems.filter((p) => !p.completed);
    if (overdue.length > 0) result.push({ emoji: "⏰", title: "Pending Prep Tasks", desc: `${overdue.length} tasks not yet complete`, icon: "⚠", iconColor: "#F97316" });
    return result;
  }, [functions, prepItems, sickStaffIds]);

  const laborHours = staff.reduce((n, s) => {
    const start = s.shiftStart.split(":").map(Number);
    const end = s.shiftEnd.split(":").map(Number);
    return n + ((end[0] * 60 + end[1]) - (start[0] * 60 + start[1])) / 60;
  }, 0);
  const laborPerFn = functions.length > 0 ? (laborHours / functions.length).toFixed(1) : "0";

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0D1117" },
    header: { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "flex-end" },
    headerLeft: { flex: 1 },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#F0F6FC" },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8B949E", marginTop: 2 },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 2 },
    backBtnText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8B949E" },
    kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginHorizontal: 20, marginBottom: 24 },
    kpiCard: { flex: 1, minWidth: "44%", backgroundColor: "#161B22", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14 },
    kpiRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 },
    kpiValue: { fontSize: 24, fontFamily: "Inter_600SemiBold" },
    kpiTrend: { fontSize: 11, fontFamily: "Inter_500Medium" },
    kpiLabel: { fontSize: 13, color: "#8B949E", fontFamily: "Inter_400Regular" },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#F0F6FC", marginBottom: 4 },
    sectionSub: { fontSize: 13, color: "#8B949E", fontFamily: "Inter_400Regular", marginBottom: 12 },
    chartWrap: { marginHorizontal: 20, marginBottom: 24 },
    chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 120, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)", paddingBottom: 8, marginBottom: 8 },
    barCol: { alignItems: "center", gap: 8, width: 32 },
    barWrapper: { height: 100, width: "100%", alignItems: "center", justifyContent: "flex-end" },
    barLabel: { fontSize: 11, color: "#8B949E", fontFamily: "Inter_500Medium" },
    fnListCard: { marginHorizontal: 20, backgroundColor: "#161B22", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 24 },
    fnItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
    fnItemRow1: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    fnName: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#F0F6FC" },
    fnDate: { fontSize: 12, color: "#8B949E", fontFamily: "Inter_400Regular", marginTop: 2 },
    statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100, flexDirection: "row", alignItems: "center", gap: 4 },
    progressBg: { height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", position: "relative" },
    progressFill: { position: "absolute", top: 0, left: 0, bottom: 0, backgroundColor: "#F97316", borderRadius: 2 },
    progressText: { fontSize: 11, color: "#8B949E", fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "right" },
    incidentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)", marginHorizontal: 20 },
    incidentLeft: { flexDirection: "row", gap: 12 },
    incidentTitle: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#F0F6FC", marginBottom: 4 },
    incidentDesc: { fontSize: 13, color: "#8B949E", fontFamily: "Inter_400Regular" },
    laborCard: { marginHorizontal: 20, backgroundColor: "#161B22", borderRadius: 12, borderWidth: 1, borderLeftWidth: 4, borderLeftColor: "#EAB308", borderColor: "rgba(255,255,255,0.08)", padding: 18, marginBottom: 24 },
    laborLabel: { fontSize: 13, color: "#8B949E", fontFamily: "Inter_400Regular", marginBottom: 6 },
    laborValue: { fontSize: 26, fontFamily: "Inter_600SemiBold", color: "#F0F6FC", marginBottom: 4 },
    laborBench: { fontSize: 13, color: "#8B949E", fontFamily: "Inter_400Regular", marginBottom: 12 },
    laborWarn: { fontSize: 12, color: "#EAB308", fontFamily: "Inter_500Medium", backgroundColor: "rgba(234,179,8,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, alignSelf: "flex-start" },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 20 },
    noAccess: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  });

  if (!isManager) {
    return (
      <View style={[s.root, s.noAccess]}>
        <Ionicons name="lock-closed" size={48} color="rgba(255,255,255,0.1)" />
        <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#F0F6FC", marginTop: 16, textAlign: "center" }}>Managers Only</Text>
        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: "#8B949E", textAlign: "center", marginTop: 8, lineHeight: 22 }}>
          Analytics is for managers only.{"\n"}Sign in as yourself on the Roster tab.
        </Text>
        <Pressable style={({ pressed }) => ({ marginTop: 20, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F97316", opacity: pressed ? 0.8 : 1 })} onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color="#fff" />
          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.title}>Analytics</Text>
            <Text style={s.subtitle}>{weekLabel}</Text>
          </View>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={14} color="#8B949E" />
            <Text style={s.backBtnText}>Back</Text>
          </Pressable>
        </View>

        {/* KPIs */}
        <View style={s.kpiGrid}>
          <View style={s.kpiCard}>
            <View style={s.kpiRow}>
              <Text style={[s.kpiValue, { color: "#F0F6FC" }]}>{functions.length}</Text>
              <Text style={[s.kpiTrend, { color: "#22C55E" }]}>Functions</Text>
            </View>
            <Text style={s.kpiLabel}>Scheduled today</Text>
          </View>
          <View style={s.kpiCard}>
            <View style={s.kpiRow}>
              <Text style={[s.kpiValue, { color: "#F0F6FC" }]}>{totalGuests}</Text>
              <Text style={[s.kpiTrend, { color: "#22C55E" }]}>Covers</Text>
            </View>
            <Text style={s.kpiLabel}>Total guests</Text>
          </View>
          <View style={s.kpiCard}>
            <View style={s.kpiRow}>
              <Text style={[s.kpiValue, { color: "#F97316" }]}>{prepPct}%</Text>
              <Text style={[s.kpiTrend, { color: prepPct > 80 ? "#22C55E" : "#EF4444" }]}>
                {prepDone}/{prepTotal}
              </Text>
            </View>
            <Text style={s.kpiLabel}>Prep complete</Text>
          </View>
          <View style={s.kpiCard}>
            <View style={s.kpiRow}>
              <Text style={[s.kpiValue, { color: "#22C55E" }]}>{onTimeRate}%</Text>
              <Text style={[s.kpiTrend, { color: "#8B949E" }]}>On-time</Text>
            </View>
            <Text style={s.kpiLabel}>Service rate</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={s.chartWrap}>
          <Text style={s.sectionTitle}>Weekly Completion Rate</Text>
          <Text style={s.sectionSub}>Prep tasks completed on time</Text>
          <View style={s.chartBars}>
            {chartData.map((d, i) => (
              <View key={i} style={s.barCol}>
                <View style={s.barWrapper}>
                  <View style={{
                    width: 24,
                    height: d.pct === 0 ? 4 : Math.max(4, d.pct),
                    backgroundColor: d.pct === 0 ? "rgba(255,255,255,0.04)" : "#F97316",
                    borderRadius: 4,
                    ...(d.today ? { shadowColor: "#F97316", shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } } : {}),
                  }} />
                </View>
                <Text style={[s.barLabel, d.today && { color: "#F97316", fontFamily: "Inter_600SemiBold" }]}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Function Performance */}
        <Text style={[s.sectionTitle, { marginHorizontal: 20, marginBottom: 12 }]}>Function Performance</Text>
        <View style={s.fnListCard}>
          {functions.length === 0 && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: "#8B949E", fontFamily: "Inter_400Regular" }}>No functions today</Text>
            </View>
          )}
          {functions.map((fn, i) => {
            const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
            const done = fnPrep.filter((p) => p.completed).length;
            const total = fnPrep.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isLast = i === functions.length - 1;
            return (
              <View key={fn.id} style={[s.fnItem, isLast && { borderBottomWidth: 0 }]}>
                <View style={s.fnItemRow1}>
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F97316", marginTop: 4 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.fnName} numberOfLines={1}>{fn.name}</Text>
                      <Text style={s.fnDate}>{fn.room} · {fn.guestCount} covers</Text>
                    </View>
                  </View>
                  <View style={[s.statusPill, { backgroundColor: "rgba(34,197,94,0.1)" }]}>
                    <Text style={{ fontSize: 9 }}>●</Text>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#22C55E" }}>On Time</Text>
                  </View>
                </View>
                {total > 0 && (
                  <>
                    <View style={s.progressBg}>
                      <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: pct === 100 ? "#22C55E" : "#F97316" }]} />
                    </View>
                    <Text style={s.progressText}>{pct === 100 ? "100% done" : `${pct}%`}</Text>
                  </>
                )}
              </View>
            );
          })}
        </View>

        {/* Incidents */}
        {incidents.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { marginHorizontal: 20, marginBottom: 12 }]}>Incidents This Week</Text>
            {incidents.map((inc, i) => (
              <View key={i} style={[s.incidentRow, i === incidents.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={s.incidentLeft}>
                  <Text style={{ fontSize: 16 }}>{inc.emoji}</Text>
                  <View>
                    <Text style={s.incidentTitle}>{inc.title}</Text>
                    <Text style={s.incidentDesc}>{inc.desc}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, color: inc.iconColor }}>{inc.icon}</Text>
              </View>
            ))}
            <View style={{ height: 24 }} />
          </>
        )}

        {/* Labor */}
        <View style={s.laborCard}>
          <Text style={s.laborLabel}>Staffing Efficiency</Text>
          <Text style={s.laborValue}>{laborPerFn}h / function avg</Text>
          <Text style={s.laborBench}>Staff on today: {staff.length} · Sick: {sickStaffIds.length}</Text>
          <Text style={s.laborWarn}>{staff.length} staff across {functions.length} function{functions.length !== 1 ? "s" : ""}</Text>
        </View>

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
