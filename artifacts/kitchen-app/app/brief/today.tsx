import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrepTeam, useKitchen } from "@/context/KitchenContext";

const TEAM_COLORS: Record<PrepTeam, string> = {
  "Hot Kitchen":   "#F97316",
  "Cold Larder":   "#3B82F6",
  "Pastry":        "#8B5CF6",
  "Function Team": "#22C55E",
  "Butchery":      "#EF4444",
};

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function TodayBriefScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { functions, staff, sickStaffIds } = useKitchen();
  const [searchName, setSearchName] = useState("");

  const now = new Date();
  const dayLabel = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;

  /* ── All staff on shift across all functions ── */
  const allOnShiftIds = useMemo(() => {
    const ids = new Set<string>();
    functions.forEach((fn) => fn.teamIds.forEach((id) => ids.add(id)));
    return ids;
  }, [functions]);

  const onShiftStaff = useMemo(
    () => staff.filter((m) => allOnShiftIds.has(m.id) && !sickStaffIds.includes(m.id)),
    [staff, allOnShiftIds, sickStaffIds]
  );

  /* ── "Find your name" alphabetical list ── */
  const sortedStaff = useMemo(() => {
    const q = searchName.trim().toLowerCase();
    const list = q
      ? onShiftStaff.filter((m) => m.name.toLowerCase().includes(q) || m.staffNumber.toLowerCase().includes(q))
      : onShiftStaff;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [onShiftStaff, searchName]);

  /* map staff id → functions they're on */
  const staffFunctions = useMemo(() => {
    const map = new Map<string, string[]>();
    functions.forEach((fn) => {
      fn.teamIds.forEach((sid) => {
        const current = map.get(sid) ?? [];
        map.set(sid, [...current, fn.name]);
      });
    });
    return map;
  }, [functions]);

  const totalDietary = useMemo(
    () => functions.reduce((n, fn) => n + (fn.dietaryRequirements?.reduce((a, r) => a + r.count, 0) ?? 0), 0),
    [functions]
  );

  const s = StyleSheet.create({
    root:          { flex: 1, backgroundColor: "#F1F5F9" },
    header:        { backgroundColor: "#0D1117", paddingTop: insets.top + (Platform.OS === "web" ? 24 : 12), paddingBottom: 0 },
    backRow:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 },
    backBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: "#ffffff18", alignItems: "center", justifyContent: "center", marginRight: 12 },
    eyebrow:       { fontSize: 11, fontFamily: "Inter_700Bold", color: "#F97316", letterSpacing: 1.4, textTransform: "uppercase" },
    heroTitle:     { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", lineHeight: 32, paddingHorizontal: 20, marginBottom: 4 },
    heroSub:       { fontSize: 13, fontFamily: "Inter_400Regular", color: "#94A3B8", paddingHorizontal: 20, marginBottom: 18 },
    statsStrip:    { flexDirection: "row", backgroundColor: "#0D1117" },
    statBox:       { flex: 1, alignItems: "center", paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#242938" },
    statNum:       { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    statLabel:     { fontSize: 10, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 2 },
    statDiv:       { width: 1, backgroundColor: "#242938", marginVertical: 10 },
    body:          { flex: 1, padding: 16 },
    sectionLabel:  { fontSize: 11, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, marginTop: 4 },
    /* Search */
    searchBox:     { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 11, marginBottom: 12 },
    searchInput:   { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1E293B" },
    /* Name card */
    nameCard:      { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8, overflow: "hidden" },
    nameRow:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
    avatar:        { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    avatarText:    { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    nameText:      { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B" },
    roleText:      { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 1 },
    teamPill:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    teamPillText:  { fontSize: 10, fontFamily: "Inter_700Bold" },
    /* Function card */
    fnCard:        { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 14, overflow: "hidden" },
    fnHeader:      { backgroundColor: "#0D1117", paddingHorizontal: 16, paddingVertical: 14 },
    fnName:        { fontSize: 17, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginBottom: 4 },
    fnMeta:        { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
    fnMetaText:    { fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    fnMetaDot:     { fontSize: 12, color: "#475569" },
    teamHeader:    { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    teamAvatar:    { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    teamAvatarText:{ fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    teamName:      { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1E293B", flex: 1 },
    memberRow:     { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
    memberDot:     { width: 8, height: 8, borderRadius: 4 },
    memberName:    { fontSize: 14, fontFamily: "Inter_500Medium", color: "#334155", flex: 1 },
    memberRole:    { fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    leaderBadge:   { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
    leaderBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    /* Dietary */
    dietaryCard:   { backgroundColor: "#FFFBEB", borderRadius: 14, borderWidth: 1, borderColor: "#FCD34D", marginBottom: 14, overflow: "hidden" },
    dietaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: "#FCD34D" },
    dietaryHeaderText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#92400E", flex: 1 },
    dietaryRow:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#FEF3C7" },
    dietaryFnName: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#B45309", width: 100 },
    dietaryName:   { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#78350F", flex: 1 },
    dietaryCount:  { fontSize: 16, fontFamily: "Inter_700Bold", color: "#D97706" },
    /* Footer */
    footer:        { paddingVertical: 28, alignItems: "center", paddingBottom: insets.bottom + 32 },
    footerText:    { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", textAlign: "center", lineHeight: 17, marginTop: 6 },
  });

  const avatarColor = (name: string) => {
    const colors = ["#F97316","#3B82F6","#8B5CF6","#22C55E","#EF4444","#F59E0B","#06B6D4","#EC4899"];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
    return colors[h];
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        {Platform.OS !== "web" && (
          <View style={s.backRow}>
            <Pressable style={s.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={16} color="#FFFFFF" />
            </Pressable>
            <Text style={s.eyebrow}>Daily Brief</Text>
          </View>
        )}
        {Platform.OS === "web" && (
          <View style={{ paddingHorizontal: 20, marginBottom: 6 }}>
            <Text style={s.eyebrow}>KitchenCommand · Daily Brief</Text>
          </View>
        )}
        <Text style={s.heroTitle}>Today's Service</Text>
        <Text style={s.heroSub}>{dayLabel} · {functions.length} function{functions.length !== 1 ? "s" : ""} · {onShiftStaff.length} staff on</Text>

        <View style={s.statsStrip}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{functions.length}</Text>
            <Text style={s.statLabel}>Functions</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statBox}>
            <Text style={s.statNum}>{onShiftStaff.length}</Text>
            <Text style={s.statLabel}>Staff on</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statBox}>
            <Text style={s.statNum}>{functions.reduce((n, fn) => n + fn.guestCount, 0)}</Text>
            <Text style={s.statLabel}>Total guests</Text>
          </View>
          {totalDietary > 0 && (
            <>
              <View style={s.statDiv} />
              <View style={s.statBox}>
                <Text style={[s.statNum, { color: "#F59E0B" }]}>{totalDietary}</Text>
                <Text style={s.statLabel}>Dietary</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* ── FIND YOUR NAME ────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>Find Your Name</Text>

        {/* Search */}
        <View style={s.searchBox}>
          <Feather name="search" size={16} color="#94A3B8" />
          <TextInput
            style={s.searchInput}
            value={searchName}
            onChangeText={setSearchName}
            placeholder="Type your name to find your team…"
            placeholderTextColor="#94A3B8"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {sortedStaff.length === 0 && onShiftStaff.length === 0 ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: "#94A3B8", textAlign: "center" }}>
              No staff assigned to today's functions yet.{"\n"}Check back closer to service.
            </Text>
          </View>
        ) : (
          sortedStaff.map((member) => {
            const tc = TEAM_COLORS[member.section as PrepTeam] ?? "#6B7280";
            const fns = staffFunctions.get(member.id) ?? [];
            const isLeader = !!member.teamLeadFor;
            return (
              <View key={member.id} style={s.nameCard}>
                <View style={s.nameRow}>
                  <View style={[s.avatar, { backgroundColor: avatarColor(member.name) }]}>
                    <Text style={s.avatarText}>{member.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Text style={s.nameText}>{member.name}</Text>
                      {isLeader && (
                        <View style={[s.leaderBadge, { backgroundColor: tc + "20" }]}>
                          <Text style={[s.leaderBadgeText, { color: tc }]}>TEAM LEADER</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.roleText}>{member.role}{member.staffNumber ? ` · ${member.staffNumber}` : ""}</Text>
                    {fns.length > 0 && (
                      <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 2 }} numberOfLines={1}>
                        {fns.join(" · ")}
                      </Text>
                    )}
                  </View>
                  {member.section && (
                    <View style={[s.teamPill, { backgroundColor: tc + "18" }]}>
                      <Text style={[s.teamPillText, { color: tc }]}>{member.section}</Text>
                    </View>
                  )}
                </View>
                {isLeader && member.phone && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingBottom: 10, paddingTop: 0 }}>
                    <Feather name="phone" size={12} color={tc} />
                    <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: tc }}>{member.phone} · Call for questions</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* ── TODAY'S FUNCTIONS ─────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>Today's Functions — Rooms & Teams</Text>

        {functions.map((fn) => {
          const fnStaff = staff.filter((m) => fn.teamIds.includes(m.id));
          const sections = Array.from(new Set(fnStaff.map((m) => m.section).filter(Boolean))) as PrepTeam[];

          return (
            <View key={fn.id} style={s.fnCard}>
              <View style={s.fnHeader}>
                <Text style={s.fnName}>{fn.name}</Text>
                <View style={s.fnMeta}>
                  <Feather name="map-pin" size={12} color="#94A3B8" />
                  <Text style={s.fnMetaText}>{fn.room}</Text>
                  {fn.floor ? <><Text style={s.fnMetaDot}>·</Text><Text style={s.fnMetaText}>{fn.floor}</Text></> : null}
                  <Text style={s.fnMetaDot}>·</Text>
                  <Feather name="clock" size={12} color="#94A3B8" />
                  <Text style={s.fnMetaText}>{fn.startTime} – {fn.endTime}</Text>
                  <Text style={s.fnMetaDot}>·</Text>
                  <Text style={s.fnMetaText}>{fn.guestCount} guests</Text>
                </View>
              </View>

              {sections.map((team) => {
                const tc = TEAM_COLORS[team] ?? "#6B7280";
                const teamMembers = fnStaff.filter((m) => m.section === team);
                const leader = teamMembers.find((m) => m.teamLeadFor === team);
                const others = teamMembers.filter((m) => m !== leader);

                return (
                  <View key={team}>
                    <View style={s.teamHeader}>
                      <View style={[s.teamAvatar, { backgroundColor: tc }]}>
                        <Text style={s.teamAvatarText}>{team.charAt(0)}</Text>
                      </View>
                      <Text style={s.teamName}>{team}</Text>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8" }}>{teamMembers.length} staff</Text>
                    </View>

                    {leader && (
                      <View style={[s.memberRow, { backgroundColor: tc + "08" }]}>
                        <Feather name="star" size={13} color={tc} />
                        <Text style={[s.memberName, { fontFamily: "Inter_700Bold" }]}>{leader.name}</Text>
                        <Text style={[s.memberRole, { color: tc }]}>Leader</Text>
                        {leader.phone && (
                          <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: tc }}>{leader.phone}</Text>
                        )}
                      </View>
                    )}

                    {others.map((m, idx) => (
                      <View key={m.id} style={[s.memberRow, idx === others.length - 1 && !sections[sections.indexOf(team) + 1] && { borderBottomWidth: 0 }]}>
                        <View style={[s.memberDot, { backgroundColor: tc }]} />
                        <Text style={s.memberName}>{m.name}</Text>
                        <Text style={s.memberRole}>{m.role}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}

              {fnStaff.length === 0 && (
                <View style={{ padding: 14 }}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: "#94A3B8" }}>No staff assigned yet.</Text>
                </View>
              )}
            </View>
          );
        })}

        {totalDietary > 0 && (
          <View style={[s.dietaryCard, { marginBottom: 14 }]}>
            <View style={s.dietaryHeader}>
              <Ionicons name="warning" size={16} color="#92400E" />
              <Text style={s.dietaryHeaderText}>⚠️ Dietary across all functions — check every plate</Text>
            </View>
            {functions.flatMap((fn) =>
              (fn.dietaryRequirements ?? []).map((req, i) => (
                <View key={`${fn.id}-${i}`} style={s.dietaryRow}>
                  <Text style={s.dietaryFnName} numberOfLines={1}>{fn.room}</Text>
                  <Text style={s.dietaryName}>{req.name}</Text>
                  <Text style={s.dietaryCount}>{req.count}</Text>
                  <Text style={{ fontSize: 11, color: "#92400E", fontFamily: "Inter_400Regular" }}> guests</Text>
                </View>
              ))
            )}
          </View>
        )}

        <View style={s.footer}>
          <Feather name="shield" size={18} color="#CBD5E1" />
          <Text style={s.footerText}>
            KitchenCommand · Daily Brief{"\n"}
            {dayLabel} · Questions? See your team leader.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
