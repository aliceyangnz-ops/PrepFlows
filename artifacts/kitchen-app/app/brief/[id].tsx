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

const COURSE_ORDER: Array<{ key: string; label: string }> = [
  { key: "amuse",   label: "Amuse-bouche" },
  { key: "entree",  label: "Entrée" },
  { key: "main",    label: "Main" },
  { key: "dessert", label: "Dessert" },
  { key: "supper",  label: "Supper" },
];

export default function BriefScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, staff } = useKitchen();

  const fn = functions.find((f) => f.id === id);

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
      backgroundColor: "#0D1117",
      paddingTop: insets.top + 16,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    backRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#ffffff18", alignItems: "center", justifyContent: "center" },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: "#F9731620", borderWidth: 1.5, borderColor: "#F97316", alignSelf: "flex-start", marginBottom: 10 },
    badgeText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#F97316" },
    fnName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginBottom: 10, lineHeight: 28 },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    detailText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#E2E8F0" },
    detailMuted: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, marginTop: 8 },
    card: { borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12, overflow: "hidden" },
    teamHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    teamAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    teamAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    teamName: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1 },
    memberCountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    memberCountText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    leaderRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", backgroundColor: "#FAFBFF" },
    leaderIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF2FF" },
    leaderLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#6366F1", textTransform: "uppercase", letterSpacing: 0.8 },
    leaderName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B" },
    phoneBtn: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    phoneText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#4F46E5" },
    memberRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    memberDot: { width: 8, height: 8, borderRadius: 4 },
    memberName: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#334155", flex: 1 },
    memberRole: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    timesCard: { borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12, overflow: "hidden" },
    timeRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    timeLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#475569", width: 120 },
    timeValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#F97316" },
    dietaryCard: { borderRadius: 14, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D", marginBottom: 12, overflow: "hidden" },
    dietaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: "#FCD34D" },
    dietaryHeaderText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#92400E" },
    dietaryRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#FEF3C7" },
    dietaryName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#78350F", flex: 1 },
    dietaryCount: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#D97706" },
    dietaryCountLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#92400E" },
    guestBar: { backgroundColor: "#0D1117", padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, marginBottom: 12 },
    guestNum: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    guestLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#94A3B8" },
    footer: { padding: 20, alignItems: "center", paddingBottom: insets.bottom + 20 },
    footerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8", textAlign: "center" },
    noData: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
    noDataTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1E293B", marginTop: 16, textAlign: "center" },
    noDataText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "center", marginTop: 8, lineHeight: 22 },
  });

  if (!fn) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="qr-code-outline" size={60} color="#CBD5E1" />
        <Text style={s.noDataTitle}>Brief Not Found</Text>
        <Text style={s.noDataText}>
          Ask your team leader to regenerate the QR code or check your shift assignment.
        </Text>
      </View>
    );
  }

  const fnStaff = staff.filter((s) => fn.teamIds.includes(s.id));

  const teamsInUse = Array.from(
    new Set(fnStaff.map((m) => m.section).filter(Boolean))
  ) as PrepTeam[];

  const activeTimes = COURSE_ORDER.filter(
    (c) => fn.serviceTimes && fn.serviceTimes[c.key as keyof typeof fn.serviceTimes]
  );

  const totalDietary = fn.dietaryRequirements?.reduce((n, r) => n + r.count, 0) ?? 0;

  return (
    <View style={s.root}>
      {/* Dark header */}
      <View style={s.header}>
        {Platform.OS !== "web" && (
          <View style={s.backRow}>
            <Pressable style={s.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
        <View style={s.badge}>
          <Text style={s.badgeText}>{fn.functionType}</Text>
        </View>
        <Text style={s.fnName}>{fn.name}</Text>
        <View style={s.detailRow}>
          <Feather name="map-pin" size={14} color="#94A3B8" />
          <Text style={s.detailText}>{fn.room}</Text>
          <Text style={s.detailMuted}>{fn.floor}</Text>
        </View>
        <View style={s.detailRow}>
          <Feather name="clock" size={14} color="#94A3B8" />
          <Text style={s.detailText}>{fn.startTime} – {fn.endTime}</Text>
        </View>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Guests + dietary summary */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
          <View style={[s.guestBar, { flex: 1 }]}>
            <Feather name="users" size={20} color="#64748B" />
            <View>
              <Text style={s.guestNum}>{fn.guestCount}</Text>
              <Text style={s.guestLabel}>Guests</Text>
            </View>
          </View>
          {totalDietary > 0 && (
            <View style={[s.guestBar, { flex: 1, backgroundColor: "#78350F" }]}>
              <Ionicons name="warning" size={20} color="#FCD34D" />
              <View>
                <Text style={s.guestNum}>{totalDietary}</Text>
                <Text style={[s.guestLabel, { color: "#FCD34D" }]}>Dietary</Text>
              </View>
            </View>
          )}
        </View>

        {/* Service times */}
        {activeTimes.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Service Times</Text>
            <View style={s.timesCard}>
              {activeTimes.map((c) => {
                const t = fn.serviceTimes![c.key as keyof typeof fn.serviceTimes];
                return (
                  <View key={c.key} style={s.timeRow}>
                    <Text style={s.timeLabel}>{c.label}</Text>
                    <Text style={s.timeValue}>{t}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Teams */}
        <Text style={s.sectionLabel}>Teams on This Function</Text>
        {teamsInUse.map((team) => {
          const tc = TEAM_COLORS[team] ?? "#6B7A94";
          const teamMembers = fnStaff.filter((m) => m.section === team);
          const leader = teamMembers.find((m) => m.teamLeadFor === team) ?? null;
          const others = teamMembers.filter((m) => m !== leader);
          return (
            <View key={team} style={s.card}>
              {/* Team header */}
              <View style={s.teamHeader}>
                <View style={[s.teamAvatar, { backgroundColor: tc }]}>
                  <Text style={s.teamAvatarText}>{team.charAt(0)}</Text>
                </View>
                <Text style={[s.teamName, { color: "#1E293B" }]}>{team}</Text>
                <View style={[s.memberCountBadge, { backgroundColor: tc + "20" }]}>
                  <Text style={[s.memberCountText, { color: tc }]}>{teamMembers.length} staff</Text>
                </View>
              </View>

              {/* Team leader */}
              {leader && (
                <View style={s.leaderRow}>
                  <View style={[s.leaderIcon, { backgroundColor: tc + "20" }]}>
                    <Feather name="star" size={14} color={tc} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.leaderLabel}>Team Leader</Text>
                    <Text style={s.leaderName}>{leader.name}</Text>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" }}>{leader.role}</Text>
                  </View>
                  {leader.phone && (
                    <View style={s.phoneBtn}>
                      <Feather name="phone" size={14} color="#4F46E5" />
                      <Text style={s.phoneText}>{leader.phone}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Other team members */}
              {others.map((m) => (
                <View key={m.id} style={s.memberRow}>
                  <View style={[s.memberDot, { backgroundColor: tc }]} />
                  <Text style={s.memberName}>{m.name}</Text>
                  <Text style={s.memberRole}>{m.role}</Text>
                </View>
              ))}
            </View>
          );
        })}

        {/* Dietary alerts */}
        {fn.dietaryRequirements && fn.dietaryRequirements.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Dietary Requirements — Be Aware</Text>
            <View style={s.dietaryCard}>
              <View style={s.dietaryHeader}>
                <Ionicons name="warning" size={16} color="#92400E" />
                <Text style={s.dietaryHeaderText}>All kitchen staff must know these. Ask your team leader if unsure.</Text>
              </View>
              {fn.dietaryRequirements.map((req, i) => (
                <View key={i} style={[s.dietaryRow, i === fn.dietaryRequirements.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={s.dietaryName}>{req.name}</Text>
                  <Text style={s.dietaryCount}>{req.count}</Text>
                  <Text style={s.dietaryCountLabel}> guests</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Feather name="shield" size={18} color="#CBD5E1" style={{ marginBottom: 6 }} />
          <Text style={s.footerText}>
            KitchenCommand · Staff Brief{"\n"}
            If anything is unclear, contact your team leader before service.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
