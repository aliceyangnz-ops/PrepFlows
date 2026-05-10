import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrepTeam, StaffMember, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

const TEAM_COLORS: Record<PrepTeam, string> = {
  "Hot Kitchen":   "#F97316",
  "Cold Larder":   "#3B82F6",
  "Pastry":        "#8B5CF6",
  "Function Team": "#22C55E",
  "Butchery":      "#EF4444",
};

const COURSE_ORDER: Array<{ key: string; label: string; emoji: string }> = [
  { key: "amuse",   label: "Amuse-bouche", emoji: "🥄" },
  { key: "entree",  label: "Entrée",       emoji: "🍽" },
  { key: "main",    label: "Main",         emoji: "🍖" },
  { key: "dessert", label: "Dessert",      emoji: "🍮" },
  { key: "supper",  label: "Supper",       emoji: "🥗" },
];

export default function BriefScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, staff } = useKitchen();

  const fn = functions.find((f) => f.id === id);

  /* ── styles ──────────────────────────────────────────────────── */
  const s = StyleSheet.create({
    root:          { flex: 1, backgroundColor: "#F1F5F9" },
    /* Header */
    header:        { backgroundColor: "#0D1117", paddingTop: insets.top + (Platform.OS === "web" ? 24 : 16), paddingBottom: 0, paddingHorizontal: 0 },
    backRow:       { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, paddingHorizontal: 20 },
    backBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: "#ffffff18", alignItems: "center", justifyContent: "center" },
    typeBadge:     { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: "#F9731620", borderWidth: 1.5, borderColor: "#F97316", marginBottom: 10, marginHorizontal: 20 },
    typeBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#F97316" },
    fnName:        { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", lineHeight: 32, paddingHorizontal: 20, marginBottom: 6 },
    fnSub:         { fontSize: 14, fontFamily: "Inter_400Regular", color: "#94A3B8", paddingHorizontal: 20, marginBottom: 20 },
    /* WHERE TO GO hero */
    whereHero:     { backgroundColor: "#161B27", borderTopWidth: 1, borderTopColor: "#242938", paddingVertical: 18, paddingHorizontal: 20 },
    whereEyebrow:  { fontSize: 10, fontFamily: "Inter_700Bold", color: "#F97316", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 },
    whereRoom:     { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF", lineHeight: 36, marginBottom: 4 },
    whereFloor:    { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },
    whereTime:     { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#242938" },
    whereTimeText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#E2E8F0" },
    /* Stats strip */
    statsStrip:    { flexDirection: "row", backgroundColor: "#0D1117", paddingBottom: 0 },
    statBox:       { flex: 1, alignItems: "center", paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#242938" },
    statNum:       { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    statLabel:     { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 2 },
    statDiv:       { width: 1, backgroundColor: "#242938", marginVertical: 10 },
    /* Body */
    body:          { flex: 1, paddingTop: 16, paddingHorizontal: 16 },
    sectionLabel:  { fontSize: 11, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, marginTop: 4 },
    /* Team cards */
    card:          { borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12, overflow: "hidden" },
    teamHeader:    { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    teamAvatar:    { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    teamAvatarText:{ fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    teamName:      { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1E293B", flex: 1 },
    memberCountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    memberCountText:  { fontSize: 11, fontFamily: "Inter_700Bold" },
    leaderRow:     { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", backgroundColor: "#FAFBFF" },
    leaderIcon:    { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    leaderLabel:   { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
    leaderName:    { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B" },
    leaderRole:    { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },
    phoneBtn:      { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    phoneText:     { fontSize: 14, fontFamily: "Inter_700Bold" },
    memberRow:     { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
    memberDot:     { width: 8, height: 8, borderRadius: 4 },
    memberName:    { fontSize: 14, fontFamily: "Inter_500Medium", color: "#334155", flex: 1 },
    memberRole:    { fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    memberSection: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
    memberSectionText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
    /* Run of day */
    runCard:       { borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12, overflow: "hidden" },
    runRow:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    runTime:       { fontSize: 15, fontFamily: "Inter_700Bold", color: "#F97316", width: 56 },
    runLabel:      { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1E293B", flex: 1 },
    runDone:       { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    /* Menu */
    menuCard:      { borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12, overflow: "hidden" },
    menuRow:       { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    menuEmoji:     { fontSize: 20, lineHeight: 26 },
    menuCourse:    { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 },
    menuDish:      { fontSize: 14, fontFamily: "Inter_500Medium", color: "#1E293B", marginTop: 2 },
    menuTime:      { fontSize: 13, fontFamily: "Inter_700Bold", color: "#F97316" },
    /* Dietary */
    dietaryCard:   { borderRadius: 14, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D", marginBottom: 12, overflow: "hidden" },
    dietaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: "#FCD34D" },
    dietaryHeaderText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#92400E", flex: 1 },
    dietaryRow:    { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#FEF3C7" },
    dietaryName:   { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#78350F", flex: 1 },
    dietaryCount:  { fontSize: 18, fontFamily: "Inter_700Bold", color: "#D97706" },
    dietaryCountLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#92400E" },
    /* Footer */
    footer:        { padding: 24, alignItems: "center", paddingBottom: insets.bottom + 32 },
    footerLogo:    { fontSize: 12, fontFamily: "Inter_700Bold", color: "#94A3B8", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 8 },
    footerText:    { fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8", textAlign: "center", lineHeight: 18, marginTop: 4 },
    /* Not found */
    noData:        { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, backgroundColor: "#F8FAFC" },
    noDataTitle:   { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1E293B", marginTop: 16, textAlign: "center" },
    noDataText:    { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "center", marginTop: 8, lineHeight: 22 },
  });

  if (!fn) {
    return (
      <View style={s.noData}>
        <Ionicons name="qr-code-outline" size={60} color="#CBD5E1" />
        <Text style={s.noDataTitle}>Brief Not Found</Text>
        <Text style={s.noDataText}>
          Ask your team leader to show you the correct QR code, or check your shift assignment.
        </Text>
      </View>
    );
  }

  /* ── derived data ──────────────────────────────────────────────── */
  const fnStaff = staff.filter((m) => fn.teamIds.includes(m.id));
  const allSections = Array.from(
    new Set(fnStaff.map((m) => m.section).filter(Boolean))
  ) as PrepTeam[];

  /* include a catch-all "Unassigned" group for staff with no section */
  const unassigned = fnStaff.filter((m) => !m.section);

  const activeCourses = COURSE_ORDER.filter(
    (c) => fn.serviceTimes?.[c.key as keyof typeof fn.serviceTimes] || fn.menu?.[c.key as keyof typeof fn.menu]
  );

  const totalDietary = fn.dietaryRequirements?.reduce((n, r) => n + r.count, 0) ?? 0;

  /* Sort timeline by time string */
  const timeline = [...(fn.timeline ?? [])].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <View style={s.root}>
      {/* ── Dark header ────────────────────────────────────────────── */}
      <View style={s.header}>
        {Platform.OS !== "web" && (
          <View style={s.backRow}>
            <Pressable style={s.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
        <View style={s.typeBadge}>
          <Text style={s.typeBadgeText}>{fn.functionType}</Text>
        </View>
        <Text style={s.fnName}>{fn.name}</Text>
        <Text style={s.fnSub}>Today · {fn.startTime} until {fn.endTime}</Text>

        {/* ── WHERE TO GO ──────────────────────────────────────────── */}
        <View style={s.whereHero}>
          <Text style={s.whereEyebrow}>📍 Where to go</Text>
          <Text style={s.whereRoom}>{fn.room}</Text>
          {fn.floor ? <Text style={s.whereFloor}>{fn.floor}</Text> : null}
          <View style={s.whereTime}>
            <Feather name="clock" size={15} color="#94A3B8" />
            <Text style={s.whereTimeText}>
              Arrival by {fn.startTime}  ·  Finish {fn.endTime}
            </Text>
          </View>
        </View>

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <View style={s.statsStrip}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{fn.guestCount}</Text>
            <Text style={s.statLabel}>Guests</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statBox}>
            <Text style={s.statNum}>{fnStaff.length}</Text>
            <Text style={s.statLabel}>Staff on</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statBox}>
            <Text style={s.statNum}>{allSections.length || 1}</Text>
            <Text style={s.statLabel}>Teams</Text>
          </View>
          {totalDietary > 0 && (
            <>
              <View style={s.statDiv} />
              <View style={[s.statBox]}>
                <Text style={[s.statNum, { color: "#F59E0B" }]}>{totalDietary}</Text>
                <Text style={s.statLabel}>Dietary</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* ── YOUR TEAMS ────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>Your Team Allocation</Text>
        {allSections.map((team) => {
          const tc = TEAM_COLORS[team] ?? "#6B7A94";
          const teamMembers = fnStaff.filter((m) => m.section === team);
          const leader = teamMembers.find((m) => m.teamLeadFor === team) ?? null;
          const others = teamMembers.filter((m) => m !== leader);
          return (
            <View key={team} style={s.card}>
              <View style={s.teamHeader}>
                <View style={[s.teamAvatar, { backgroundColor: tc }]}>
                  <Text style={s.teamAvatarText}>{team.charAt(0)}</Text>
                </View>
                <Text style={s.teamName}>{team}</Text>
                <View style={[s.memberCountBadge, { backgroundColor: tc + "20" }]}>
                  <Text style={[s.memberCountText, { color: tc }]}>{teamMembers.length} staff</Text>
                </View>
              </View>

              {leader && (
                <View style={[s.leaderRow, { backgroundColor: tc + "08" }]}>
                  <View style={[s.leaderIcon, { backgroundColor: tc + "20" }]}>
                    <Feather name="star" size={14} color={tc} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.leaderLabel, { color: tc }]}>Team Leader — speak to me first</Text>
                    <Text style={s.leaderName}>{leader.name}</Text>
                    <Text style={s.leaderRole}>{leader.role}</Text>
                  </View>
                  {leader.phone && (
                    <View style={[s.phoneBtn, { backgroundColor: tc + "18" }]}>
                      <Feather name="phone" size={14} color={tc} />
                      <Text style={[s.phoneText, { color: tc }]}>{leader.phone}</Text>
                    </View>
                  )}
                </View>
              )}

              {others.map((m, idx) => (
                <View key={m.id} style={[s.memberRow, idx === others.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[s.memberDot, { backgroundColor: tc }]} />
                  <Text style={s.memberName}>{m.name}</Text>
                  <Text style={s.memberRole}>{m.role}</Text>
                  {m.staffNumber ? (
                    <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "#CBD5E1" }}>#{m.staffNumber}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          );
        })}

        {/* Unassigned staff */}
        {unassigned.length > 0 && (
          <View style={s.card}>
            <View style={s.teamHeader}>
              <View style={[s.teamAvatar, { backgroundColor: "#6B7280" }]}>
                <Text style={s.teamAvatarText}>?</Text>
              </View>
              <Text style={s.teamName}>General / Unassigned</Text>
              <View style={[s.memberCountBadge, { backgroundColor: "#6B728020" }]}>
                <Text style={[s.memberCountText, { color: "#6B7280" }]}>{unassigned.length} staff</Text>
              </View>
            </View>
            {unassigned.map((m, idx) => (
              <View key={m.id} style={[s.memberRow, idx === unassigned.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[s.memberDot, { backgroundColor: "#6B7280" }]} />
                <Text style={s.memberName}>{m.name}</Text>
                <Text style={s.memberRole}>{m.role}</Text>
              </View>
            ))}
          </View>
        )}

        {/* No staff assigned yet */}
        {fnStaff.length === 0 && (
          <View style={[s.card, { padding: 20, alignItems: "center" }]}>
            <Feather name="users" size={28} color="#CBD5E1" />
            <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: "#94A3B8", marginTop: 10, textAlign: "center" }}>
              No staff have been assigned yet.{"\n"}Check back closer to service time.
            </Text>
          </View>
        )}

        {/* ── RUN OF DAY ────────────────────────────────────────────── */}
        {timeline.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Run of Day</Text>
            <View style={s.runCard}>
              {timeline.map((item, idx) => (
                <View key={item.id} style={[s.runRow, idx === timeline.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={s.runTime}>{item.time}</Text>
                  <Text style={s.runLabel}>{item.label}</Text>
                  {item.completed && (
                    <View style={[s.runDone, { backgroundColor: "#22C55E20" }]}>
                      <Ionicons name="checkmark" size={13} color="#22C55E" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── MENU ─────────────────────────────────────────────────── */}
        {activeCourses.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Menu Being Served</Text>
            <View style={s.menuCard}>
              {activeCourses.map((c, idx) => {
                const time = fn.serviceTimes?.[c.key as keyof typeof fn.serviceTimes];
                const dish = fn.menu?.[c.key as keyof typeof fn.menu];
                return (
                  <View key={c.key} style={[s.menuRow, idx === activeCourses.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={s.menuEmoji}>{c.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.menuCourse}>{c.label}</Text>
                      {dish ? (
                        <Text style={s.menuDish}>{dish}</Text>
                      ) : (
                        <Text style={[s.menuDish, { color: "#94A3B8" }]}>Details to be confirmed</Text>
                      )}
                    </View>
                    {time ? <Text style={s.menuTime}>{time}</Text> : null}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── DIETARY ALERTS ───────────────────────────────────────── */}
        {fn.dietaryRequirements && fn.dietaryRequirements.length > 0 && (
          <>
            <Text style={s.sectionLabel}>⚠️ Dietary — All Staff Must Know</Text>
            <View style={s.dietaryCard}>
              <View style={s.dietaryHeader}>
                <Ionicons name="warning" size={16} color="#92400E" />
                <Text style={s.dietaryHeaderText}>Check every plate. Ask your team leader if unsure.</Text>
              </View>
              {fn.dietaryRequirements.map((req, i) => (
                <View
                  key={i}
                  style={[s.dietaryRow, i === (fn.dietaryRequirements?.length ?? 0) - 1 && { borderBottomWidth: 0 }]}
                >
                  <Text style={s.dietaryName}>{req.name}</Text>
                  <Text style={s.dietaryCount}>{req.count}</Text>
                  <Text style={s.dietaryCountLabel}> guests</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── QUICK TIPS ───────────────────────────────────────────── */}
        <Text style={s.sectionLabel}>Reminders</Text>
        <View style={[s.card, { padding: 16 }]}>
          {[
            "Go to your team leader first when you arrive.",
            "Check all dietary requirements before service.",
            "If you are unsure about anything — ask, do not guess.",
            "Keep your section clean and tidy throughout service.",
          ].map((tip, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
              <Text style={{ fontSize: 15, lineHeight: 20 }}>•</Text>
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: "#475569", lineHeight: 20, flex: 1 }}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <View style={s.footer}>
          <Feather name="shield" size={20} color="#CBD5E1" />
          <Text style={s.footerLogo}>KitchenCommand</Text>
          <Text style={s.footerText}>
            Staff Brief · {fn.name}{"\n"}
            Questions? Find your team leader in the list above.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
