import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrepTeam, MANAGER_ROLES, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";
import {
  cancelAllNotifications,
  requestNotificationPermission,
  scheduleStaffNotifications,
} from "@/hooks/useNotifications";

const HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const TOTAL_HOURS = HOURS.length;
const HOUR_WIDTH = 44;

function timeToFloat(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

function getTeamColor(team?: PrepTeam): string {
  switch (team) {
    case "Cold Larder":   return "#14B8A6";
    case "Butchery":      return "#F97316";
    case "Hot Kitchen":   return "#EF4444";
    case "Pastry":        return "#A78BFA";
    case "Function Team": return "#3B82F6";
    default:              return "#6B7A94";
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case "Head Chef":        return "#F97316";
    case "Sous Chef":        return "#3B82F6";
    case "Pastry Chef":      return "#A78BFA";
    case "Function Captain": return "#3B82F6";
    case "Casual":           return "#F59E0B";
    default:                 return "#6B7A94";
  }
}

function getFunctionTypeColor(type: string): string {
  switch (type) {
    case "A-la-carte": return "#F59E0B";
    case "Buffet":     return "#3B82F6";
    case "Cocktail":   return "#8B5CF6";
    case "Canapés":    return "#22C55E";
    case "Canapés + A-la-carte": return "#F97316";
    case "School Ball": return "#EC4899";
    case "Set Menu":   return "#14B8A6";
    case "High Tea":   return "#F43F5E";
    default:           return "#6B7A94";
  }
}

export default function RosterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { staff, functions, prepItems, currentStaffId, notificationsEnabled, sickStaffIds, setCurrentStaff, markStaffSick, resetToSampleData, clearAllData } = useKitchen();
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const minHour = HOURS[0];

  const currentMember = staff.find((s) => s.id === currentStaffId) ?? null;
  const isManager = currentMember ? (MANAGER_ROLES as readonly string[]).includes(currentMember.role) : false;

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.staffNumber.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
    );
  }, [staff, search]);

  const sickCount = sickStaffIds.length;
  const casualCount = staff.filter((s) => s.role === "Casual").length;

  async function handleSelectMe(memberId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStaffId === memberId) {
      await cancelAllNotifications();
      setCurrentStaff(null, false);
      return;
    }

    setLoading(memberId);
    const member = staff.find((s) => s.id === memberId)!;
    const assignedFunctions = functions.filter((f) => member.functionIds.includes(f.id));

    if (Platform.OS === "web") {
      setCurrentStaff(memberId, false);
      setLoading(null);
      return;
    }

    const granted = await requestNotificationPermission();
    if (granted) {
      await cancelAllNotifications();
      const scheduled = await scheduleStaffNotifications(member, assignedFunctions);
      setCurrentStaff(memberId, scheduled.length > 0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Reminders set", `You'll get ${scheduled.length} reminder${scheduled.length !== 1 ? "s" : ""} today.`, [{ text: "Got it" }]);
    } else {
      setCurrentStaff(memberId, false);
    }
    setLoading(null);
  }

  function handleSickToggle(memberId: string, currentlySick: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const member = staff.find((s) => s.id === memberId)!;
    if (!currentlySick) {
      Alert.alert(
        `Mark ${member.name.split(" ")[0]} as sick?`,
        "This will flag them absent for today's service. Managers and team leaders will see the sick call.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm sick call",
            style: "destructive",
            onPress: () => {
              markStaffSick(memberId, true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            },
          },
        ]
      );
    } else {
      markStaffSick(memberId, false);
    }
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 10 },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    headerBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    headerBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    searchRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 14, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, gap: 10, height: 44 },
    searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground },
    clearBtn: { padding: 4 },
    statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 14 },
    statCard: { flex: 1, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, padding: 11, alignItems: "center" },
    statNum: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    statLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 },
    noResults: { alignItems: "center", paddingVertical: 40 },
    noResultsText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    rosterCard: { marginHorizontal: 20, marginBottom: 12, borderRadius: colors.radius, borderWidth: 1, overflow: "hidden" },
    staffTopRow: { flexDirection: "row", alignItems: "flex-start", padding: 14, borderBottomWidth: 1, gap: 10 },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
    staffInfo: { flex: 1, gap: 2 },
    staffName: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground },
    staffRoleText: { fontSize: 12, fontFamily: "Inter_500Medium" },
    staffNumText: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
    teamBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    teamBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    leaderBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: "#22C55E20", borderWidth: 1, borderColor: "#22C55E40" },
    leaderBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#22C55E" },
    sickBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: "#EF444420", borderWidth: 1, borderColor: "#EF444440" },
    sickBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#EF4444" },
    rightActions: { alignItems: "flex-end", gap: 6 },
    shiftTime: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    actionBtnRow: { flexDirection: "row", gap: 6 },
    meBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    meBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    sickBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    sickBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    notifBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, backgroundColor: colors.accent + "20" },
    notifBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.accent },
    timelineContainer: { paddingHorizontal: 14, paddingVertical: 10 },
    timelineHeader: { flexDirection: "row", marginBottom: 4 },
    hourLabel: { fontSize: 9, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center" },
    timelineBg: { height: 10, borderRadius: 5, position: "relative", overflow: "hidden" },
    shiftBar: { position: "absolute", height: 10, borderRadius: 5 },
    functionsSection: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
    funcBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
    funcBadgeLeft: { flex: 1 },
    funcBadgeName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    funcBadgeSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    funcTypePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    funcTypePillText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    // My Tasks section
    myTasksCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: colors.radius, borderWidth: 1.5, overflow: "hidden" },
    myTasksHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
    myTasksTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold" },
    myTasksSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    myInfoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
    myInfoBlock: { flex: 1, minWidth: 100, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
    myInfoLabel: { fontSize: 9, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
    myInfoValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
    myInfoSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
    fnBlock: { borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
    fnBlockHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    fnTimeBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
    fnTimeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    fnName: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground },
    fnDetailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
    fnDetailChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7, borderWidth: 1 },
    fnDetailChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    fnTypePill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
    fnTypePillText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    prepSummaryRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 6, borderTopWidth: 1 },
    prepSummaryText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    prepProgressBar: { height: 4, flex: 1, borderRadius: 2, backgroundColor: colors.border, overflow: "hidden" },
    prepProgressFill: { height: 4, borderRadius: 2 },
    sectionDividerLabel: { fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginHorizontal: 20, marginBottom: 8, marginTop: 4 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  const myMember = staff.find((s) => s.id === currentStaffId) ?? null;
  const myTeamColor = myMember?.section ? getTeamColor(myMember.section) : colors.primary;
  const myTeamLeader = myMember?.section ? staff.find((s) => s.teamLeadFor === myMember.section && s.id !== myMember.id) ?? null : null;
  const myFunctions = myMember ? functions.filter((f) => myMember.functionIds.includes(f.id)) : [];

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Roster</Text>
              <Text style={s.subtitle}>{staff.length} staff today · {functions.length} functions</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                style={({ pressed }) => [s.headerBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => router.push("/staff/new")}
              >
                <Feather name="user-plus" size={15} color={colors.accent} />
                <Text style={[s.headerBtnText, { color: colors.accent }]}>Add</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.headerBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => setShowSettings(true)}
              >
                <Feather name="settings" size={15} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchRow}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or staff #"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && Platform.OS !== "ios" && (
            <Pressable style={s.clearBtn} onPress={() => setSearch("")}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Stats */}
        {search.length === 0 && (
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statNum}>{staff.length}</Text>
              <Text style={s.statLabel}>Total</Text>
            </View>
            <View style={[s.statCard, sickCount > 0 && { borderColor: "#EF444450", backgroundColor: "#EF444410" }]}>
              <Text style={[s.statNum, { color: sickCount > 0 ? "#EF4444" : colors.foreground }]}>{sickCount}</Text>
              <Text style={s.statLabel}>Sick today</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: colors.warning }]}>{casualCount}</Text>
              <Text style={s.statLabel}>Casuals</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: colors.primary }]}>{functions.length}</Text>
              <Text style={s.statLabel}>Functions</Text>
            </View>
          </View>
        )}

        {/* My Tasks card */}
        {myMember && search.length === 0 && (
          <>
            <Text style={s.sectionDividerLabel}>My shift today</Text>
            <View style={[s.myTasksCard, { borderColor: myTeamColor + "60", backgroundColor: myTeamColor + "08" }]}>
              <View style={[s.myTasksHeader, { borderBottomColor: myTeamColor + "30", backgroundColor: myTeamColor + "12" }]}>
                <Ionicons name="person-circle" size={22} color={myTeamColor} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.myTasksTitle, { color: myTeamColor }]}>{myMember.name}</Text>
                  <Text style={[s.myTasksSubtitle, { color: colors.mutedForeground }]}>{myMember.staffNumber} · {myMember.role}</Text>
                </View>
                {notificationsEnabled && (
                  <View style={s.notifBadge}>
                    <Ionicons name="notifications" size={11} color={colors.accent} />
                    <Text style={s.notifBadgeText}>Reminders on</Text>
                  </View>
                )}
              </View>

              {/* Key info blocks */}
              <View style={s.myInfoRow}>
                {myMember.section && (
                  <View style={[s.myInfoBlock, { backgroundColor: myTeamColor + "15", borderColor: myTeamColor + "40" }]}>
                    <Text style={[s.myInfoLabel, { color: myTeamColor }]}>Your Team</Text>
                    <Text style={[s.myInfoValue, { color: myTeamColor }]}>{myMember.section}</Text>
                    {myMember.teamLeadFor && (
                      <Text style={[s.myInfoSub, { color: myTeamColor }]}>Team Leader</Text>
                    )}
                  </View>
                )}
                {myTeamLeader && (
                  <View style={[s.myInfoBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[s.myInfoLabel, { color: colors.mutedForeground }]}>Team Leader</Text>
                    <Text style={[s.myInfoValue, { color: colors.foreground }]}>{myTeamLeader.name.split(" ")[0]}</Text>
                    <Text style={[s.myInfoSub, { color: colors.mutedForeground }]}>{myTeamLeader.role}</Text>
                  </View>
                )}
                <View style={[s.myInfoBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[s.myInfoLabel, { color: colors.mutedForeground }]}>My Shift</Text>
                  <Text style={[s.myInfoValue, { color: colors.foreground }]}>{myMember.shiftStart}</Text>
                  <Text style={[s.myInfoSub, { color: colors.mutedForeground }]}>Finish {myMember.shiftEnd}</Text>
                </View>
              </View>

              {/* Functions */}
              {myFunctions.map((fn) => {
                const ftc = getFunctionTypeColor(fn.functionType);
                const myTeamPrep = prepItems.filter((p) => p.functionId === fn.id && p.team === myMember.section);
                const myTeamDone = myTeamPrep.filter((p) => p.completed).length;
                const prepPct = myTeamPrep.length > 0 ? myTeamDone / myTeamPrep.length : 0;

                return (
                  <View key={fn.id} style={[s.fnBlock, { borderTopColor: myTeamColor + "25" }]}>
                    <View style={s.fnBlockHeader}>
                      <View style={[s.fnTimeBadge, { backgroundColor: colors.primary }]}>
                        <Text style={s.fnTimeText}>{fn.startTime}</Text>
                      </View>
                      <Text style={s.fnName} numberOfLines={1}>{fn.name}</Text>
                      <View style={[s.fnTypePill, { backgroundColor: ftc + "20" }]}>
                        <Text style={[s.fnTypePillText, { color: ftc }]}>{fn.functionType}</Text>
                      </View>
                    </View>

                    <View style={s.fnDetailGrid}>
                      <View style={[s.fnDetailChip, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                        <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                        <Text style={[s.fnDetailChipText, { color: colors.foreground }]}>{fn.room}</Text>
                      </View>
                      <View style={[s.fnDetailChip, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                        <Ionicons name="layers" size={11} color={colors.mutedForeground} />
                        <Text style={[s.fnDetailChipText, { color: colors.mutedForeground }]}>{fn.floor}</Text>
                      </View>
                      <View style={[s.fnDetailChip, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                        <Ionicons name="people" size={11} color={colors.mutedForeground} />
                        <Text style={[s.fnDetailChipText, { color: colors.foreground }]}>{fn.guestCount} guests</Text>
                      </View>
                      <View style={[s.fnDetailChip, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                        <Feather name="clock" size={11} color={colors.mutedForeground} />
                        <Text style={[s.fnDetailChipText, { color: colors.mutedForeground }]}>{fn.startTime} – {fn.endTime}</Text>
                      </View>
                    </View>

                    {myTeamPrep.length > 0 && (
                      <View style={[s.prepSummaryRow, { borderTopColor: myTeamColor + "20" }]}>
                        <Feather name="clipboard" size={13} color={myTeamColor} />
                        <Text style={s.prepSummaryText}>
                          {myMember.section} prep: {myTeamDone}/{myTeamPrep.length} done
                        </Text>
                        <View style={s.prepProgressBar}>
                          <View style={[s.prepProgressFill, { width: `${prepPct * 100}%`, backgroundColor: prepPct === 1 ? colors.accent : myTeamColor }]} />
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}

              {myFunctions.length === 0 && (
                <View style={{ padding: 16 }}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>No functions assigned yet for today.</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Staff list */}
        {search.length > 0 && (
          <Text style={s.sectionDividerLabel}>
            {filteredStaff.length} result{filteredStaff.length !== 1 ? "s" : ""} for "{search}"
          </Text>
        )}
        {search.length === 0 && (
          <Text style={s.sectionDividerLabel}>All staff</Text>
        )}

        {filteredStaff.length === 0 && (
          <View style={s.noResults}>
            <Feather name="search" size={28} color={colors.mutedForeground} />
            <Text style={[s.noResultsText, { marginTop: 12 }]}>No staff found for "{search}"</Text>
          </View>
        )}

        {filteredStaff.map((member) => {
          const rc = getRoleColor(member.role);
          const tc = getTeamColor(member.section);
          const isMe = currentStaffId === member.id;
          const isLoading = loading === member.id;
          const isSick = sickStaffIds.includes(member.id);
          const isLeader = !!member.teamLeadFor;
          const shiftStart = timeToFloat(member.shiftStart);
          const shiftEnd = timeToFloat(member.shiftEnd);
          const leftPct = (shiftStart - minHour) / TOTAL_HOURS;
          const widthPct = (shiftEnd - shiftStart) / TOTAL_HOURS;
          const memberFunctions = functions.filter((f) => member.functionIds.includes(f.id));

          return (
            <View
              key={member.id}
              style={[
                s.rosterCard,
                {
                  backgroundColor: isSick ? "#EF444408" : isMe ? rc + "10" : colors.card,
                  borderColor: isSick ? "#EF444440" : isMe ? rc + "60" : colors.border,
                  opacity: isSick ? 0.75 : 1,
                },
              ]}
            >
              <View style={[s.staffTopRow, { borderBottomColor: isSick ? "#EF444430" : isMe ? rc + "30" : colors.border }]}>
                <View style={[s.avatar, { backgroundColor: isSick ? "#EF444420" : rc + "25" }]}>
                  <Text style={[s.avatarText, { color: isSick ? "#EF4444" : rc }]}>
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </Text>
                </View>
                <View style={s.staffInfo}>
                  <Text style={[s.staffName, isSick && { textDecorationLine: "line-through", color: colors.mutedForeground }]}>
                    {member.name}
                  </Text>
                  <Text style={[s.staffRoleText, { color: isSick ? "#EF4444" : rc }]}>
                    {isSick ? "SICK — Called in" : member.role}
                  </Text>
                  <Text style={s.staffNumText}>{member.staffNumber}</Text>
                  <View style={s.badgesRow}>
                    {member.section && (
                      <View style={[s.teamBadge, { backgroundColor: tc + "20", borderColor: tc + "40" }]}>
                        <Text style={[s.teamBadgeText, { color: tc }]}>{member.section}</Text>
                      </View>
                    )}
                    {isLeader && (
                      <View style={s.leaderBadge}>
                        <Ionicons name="shield-checkmark" size={9} color="#22C55E" />
                        <Text style={s.leaderBadgeText}>Team Lead</Text>
                      </View>
                    )}
                    {isSick && (
                      <View style={s.sickBadge}>
                        <Feather name="alert-circle" size={9} color="#EF4444" />
                        <Text style={s.sickBadgeText}>Absent today</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={s.rightActions}>
                  <Text style={s.shiftTime}>{member.shiftStart}–{member.shiftEnd}</Text>
                  <View style={s.actionBtnRow}>
                    {/* Edit — managers only */}
                    {isManager && (
                      <Pressable
                        style={({ pressed }) => [
                          s.sickBtn,
                          { backgroundColor: "transparent", borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                        ]}
                        onPress={() => router.push(`/staff/${member.id}`)}
                      >
                        <Feather name="edit-2" size={11} color={colors.mutedForeground} />
                        <Text style={[s.sickBtnText, { color: colors.mutedForeground }]}>Edit</Text>
                      </Pressable>
                    )}
                    {/* Sick call button — managers only, not on themselves */}
                    {isManager && member.id !== currentStaffId && (
                      <Pressable
                        style={({ pressed }) => [
                          s.sickBtn,
                          {
                            backgroundColor: isSick ? "#EF444420" : "transparent",
                            borderColor: isSick ? "#EF4444" : colors.border,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                        onPress={() => handleSickToggle(member.id, isSick)}
                      >
                        <Feather name={isSick ? "user-x" : "user-x"} size={11} color={isSick ? "#EF4444" : colors.mutedForeground} />
                        <Text style={[s.sickBtnText, { color: isSick ? "#EF4444" : colors.mutedForeground }]}>
                          {isSick ? "Uncall" : "Sick"}
                        </Text>
                      </Pressable>
                    )}
                    {/* This is me */}
                    {!isSick && (
                      <Pressable
                        style={({ pressed }) => [
                          s.meBtn,
                          {
                            backgroundColor: isMe ? rc : "transparent",
                            borderColor: isMe ? rc : colors.border,
                            opacity: (pressed || isLoading) ? 0.7 : 1,
                          },
                        ]}
                        onPress={() => handleSelectMe(member.id)}
                        disabled={isLoading}
                      >
                        {isMe ? <Feather name="check" size={11} color="#fff" /> : <Feather name="user" size={11} color={colors.mutedForeground} />}
                        <Text style={[s.meBtnText, { color: isMe ? "#fff" : colors.mutedForeground }]}>
                          {isLoading ? "Setting…" : isMe ? "That's me" : "This is me"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  {isMe && notificationsEnabled && (
                    <View style={s.notifBadge}>
                      <Ionicons name="notifications" size={10} color={colors.accent} />
                      <Text style={s.notifBadgeText}>Reminders on</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Shift timeline */}
              {!isSick && (
                <View style={s.timelineContainer}>
                  <View style={s.timelineHeader}>
                    {HOURS.filter((_, i) => i % 2 === 0).map((h) => (
                      <Text key={h} style={[s.hourLabel, { width: HOUR_WIDTH * 2 }]}>{h}:00</Text>
                    ))}
                  </View>
                  <View style={[s.timelineBg, { width: HOUR_WIDTH * TOTAL_HOURS, backgroundColor: isMe ? rc + "20" : colors.secondary }]}>
                    <View style={[s.shiftBar, { left: `${leftPct * 100}%`, width: `${widthPct * 100}%`, backgroundColor: rc }]} />
                  </View>
                </View>
              )}

              {/* Functions */}
              {!isSick && memberFunctions.length > 0 && (
                <View style={s.functionsSection}>
                  {memberFunctions.map((fn) => {
                    const ftc = getFunctionTypeColor(fn.functionType);
                    return (
                      <View key={fn.id} style={[s.funcBadge, { backgroundColor: rc + "10", borderColor: rc + "30" }]}>
                        <View style={s.funcBadgeLeft}>
                          <Text style={s.funcBadgeName} numberOfLines={1}>{fn.name}</Text>
                          <Text style={s.funcBadgeSub}>{fn.room} · {fn.floor} · {fn.guestCount} guests · {fn.startTime}</Text>
                        </View>
                        <View style={[s.funcTypePill, { backgroundColor: ftc + "20" }]}>
                          <Text style={[s.funcTypePillText, { color: ftc }]}>{fn.functionType}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* Empty state */}
        {staff.length === 0 && search.length === 0 && (
          <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
            <Feather name="users" size={40} color={colors.mutedForeground} />
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>No staff yet</Text>
            <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" }}>
              Tap "Add" to add your first team member, or load sample data from settings.
            </Text>
            <Pressable
              style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.accent }}
              onPress={() => router.push("/staff/new")}
            >
              <Feather name="user-plus" size={16} color="#fff" />
              <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" }}>Add first staff member</Text>
            </Pressable>
          </View>
        )}

        <View style={s.bottomPad} />
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide" onRequestClose={() => setShowSettings(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "#00000060" }} onPress={() => setShowSettings(false)} />
        <View style={{
          backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 20,
          borderTopWidth: 1, borderTopColor: colors.border,
        }}>
          {/* Handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 16 }} />
          <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 }}>Settings & Data</Text>
          <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 20 }}>
            Manage staff, app data and reset options
          </Text>

          {/* Manage staff */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 14,
              padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
              backgroundColor: colors.background, marginBottom: 10, opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => { setShowSettings(false); router.push("/staff/new"); }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent + "20", alignItems: "center", justifyContent: "center" }}>
              <Feather name="user-plus" size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Add Staff Member</Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Add a new person to your roster</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>

          {/* Reset to sample */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 14,
              padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#F59E0B40",
              backgroundColor: "#F59E0B08", marginBottom: 10, opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => {
              setShowSettings(false);
              Alert.alert(
                "Load Sample Data?",
                "This will replace all current staff, functions and prep lists with the built-in demo data. Your changes will be lost.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Load sample data", onPress: () => { resetToSampleData(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } },
                ]
              );
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F59E0B20", alignItems: "center", justifyContent: "center" }}>
              <Feather name="refresh-cw" size={18} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#F59E0B" }}>Load Sample Data</Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Restore demo staff, functions and prep lists</Text>
            </View>
          </Pressable>

          {/* Clear all */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 14,
              padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#EF444440",
              backgroundColor: "#EF444408", opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => {
              setShowSettings(false);
              Alert.alert(
                "Clear All Data?",
                "This will permanently delete all staff, functions, prep lists and your sign-in. You will start with a blank slate.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear everything", style: "destructive", onPress: () => { clearAllData(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
                ]
              );
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#EF444420", alignItems: "center", justifyContent: "center" }}>
              <Feather name="trash-2" size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#EF4444" }}>Clear All Data</Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Start fresh with a blank app — cannot be undone</Text>
            </View>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
