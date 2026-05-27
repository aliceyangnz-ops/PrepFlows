import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { PrepFlowsLogo } from "@/components/PrepFlowsLogo";
import { GlassCard } from "@/components/GlassCard";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PrepTeam,
  MANAGER_ROLES,
  StaffMember,
  getAccessLevel,
  useKitchen,
} from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { type ThemeName } from "@/constants/colors";
import { useIsTablet } from "@/hooks/useIsTablet";
import {
  cancelAllNotifications,
  requestNotificationPermission,
  scheduleStaffNotifications,
} from "@/hooks/useNotifications";

const HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const TOTAL_HOURS = HOURS.length;
const HOUR_WIDTH = 44;

const THEME_OPTIONS: {
  name: ThemeName;
  label: string;
  bg: string;
  dot: string;
}[] = [
  { name: "navy", label: "Navy", bg: "#050C1A", dot: "#4D7CFF" },
  { name: "midnight", label: "Dark", bg: "#0D1117", dot: "#3B82F6" },
  { name: "violet", label: "Violet", bg: "#0A0714", dot: "#A259FF" },
  { name: "ocean", label: "Ocean", bg: "#030F18", dot: "#00E0FF" },
  { name: "ember", label: "Ember", bg: "#120900", dot: "#FF9A3C" },
];

function timeToFloat(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

function getTeamColor(team?: PrepTeam): string {
  switch (team) {
    case "Cold Larder":
      return "#14B8A6";
    case "Butchery":
      return "#F97316";
    case "Hot Kitchen":
      return "#EF4444";
    case "Pastry":
      return "#A78BFA";
    case "Function Team":
      return "#3B82F6";
    default:
      return "#6B7A94";
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case "Head Chef":
      return "#F97316";
    case "Sous Chef":
      return "#3B82F6";
    case "Pastry Chef":
      return "#8B5CF6";
    case "Pastry":
      return "#8B5CF6";
    case "Function Captain":
      return "#3B82F6";
    case "Casual":
      return "#F59E0B";
    default:
      return "#6B7A94";
  }
}

function getFunctionTypeColor(type: string): string {
  switch (type) {
    case "A-la-carte":
      return "#F59E0B";
    case "Buffet":
      return "#3B82F6";
    case "Cocktail":
      return "#8B5CF6";
    case "Canapés":
      return "#22C55E";
    case "Canapés + A-la-carte":
      return "#F97316";
    case "School Ball":
      return "#EC4899";
    case "Set Menu":
      return "#14B8A6";
    case "High Tea":
      return "#F43F5E";
    default:
      return "#6B7A94";
  }
}

function canVerify(member: StaffMember): boolean {
  return !!(
    member.pin ||
    (member.phone && member.phone.replace(/\D/g, "").length >= 4)
  );
}

function verificationHint(member: StaffMember): string {
  if (member.pin) return "Enter your sign-in PIN to confirm your identity.";
  return "Enter the last 4 digits of your phone number to confirm your identity.";
}

function checkVerification(member: StaffMember, input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (member.pin) {
    return trimmed === member.pin;
  }
  if (member.phone) {
    const digits = member.phone.replace(/\D/g, "");
    if (digits.length >= 4 && trimmed === digits.slice(-4)) return true;
  }
  return false;
}

export default function RosterScreen() {
  const colors = useColors();
  const { themeName, setThemeName } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isTablet = useIsTablet();
  const {
    staff,
    functions,
    prepItems,
    currentStaffId,
    notificationsEnabled,
    sickStaffIds,
    setCurrentStaff,
    markStaffSick,
    resetToSampleData,
    clearAllData,
    updateStaff,
  } = useKitchen();
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<StaffMember | null>(null);
  const [verifyInput, setVerifyInput] = useState("");
  const [expandedQrFnId, setExpandedQrFnId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const minHour = HOURS[0];

  const currentMember = staff.find((s) => s.id === currentStaffId) ?? null;
  const isManager = currentMember
    ? getAccessLevel(currentMember) === "manager"
    : false;

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.staffNumber.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q),
    );
  }, [staff, search]);

  const sickCount = sickStaffIds.length;
  const casualCount = staff.filter((s) => s.role === "Casual").length;

  type DisplayItem =
    | { type: "header"; section: string; count: number; sickInSection: number }
    | { type: "staff"; member: StaffMember };

  const displayItems = useMemo<DisplayItem[]>(() => {
    if (search.length > 0)
      return filteredStaff.map((m) => ({ type: "staff" as const, member: m }));
    const grouped = new Map<string, StaffMember[]>();
    filteredStaff.forEach((m) => {
      const key = m.section ?? "Other";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(m);
    });
    const result: DisplayItem[] = [];
    grouped.forEach((members, section) => {
      const sickInSection = members.filter((m) =>
        sickStaffIds.includes(m.id),
      ).length;
      result.push({
        type: "header",
        section,
        count: members.length,
        sickInSection,
      });
      members.forEach((m) => result.push({ type: "staff", member: m }));
    });
    return result;
  }, [filteredStaff, search, sickStaffIds]);

  async function doSignIn(memberId: string) {
    setLoading(memberId);
    const member = staff.find((s) => s.id === memberId)!;
    const assignedFunctions = functions.filter((f) =>
      member.functionIds.includes(f.id),
    );

    if (Platform.OS === "web") {
      setCurrentStaff(memberId, false);
      setLoading(null);
      return;
    }

    const granted = await requestNotificationPermission();
    if (granted) {
      await cancelAllNotifications();
      const scheduled = await scheduleStaffNotifications(
        member,
        assignedFunctions,
      );
      setCurrentStaff(memberId, scheduled.length > 0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Reminders set",
        `You'll get ${scheduled.length} reminder${scheduled.length !== 1 ? "s" : ""} today.`,
        [{ text: "Got it" }],
      );
    } else {
      setCurrentStaff(memberId, false);
    }
    setLoading(null);
  }

  async function handleSelectMe(memberId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStaffId === memberId) {
      await cancelAllNotifications();
      setCurrentStaff(null, false);
      return;
    }

    const member = staff.find((s) => s.id === memberId)!;
    if (!canVerify(member)) {
      Alert.alert(
        "Sign-in not set up",
        `${member.name.split(" ")[0]} doesn't have a sign-in PIN or phone number set up. Ask a manager to add one via the staff edit screen.`,
        [{ text: "OK" }],
      );
      return;
    }
    setVerifyTarget(member);
    setVerifyInput("");
  }

  function handleVerifyConfirm() {
    if (!verifyTarget) return;
    if (!checkVerification(verifyTarget, verifyInput)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Incorrect",
        "That doesn't match. Please check and try again.",
        [{ text: "Try again" }],
      );
      setVerifyInput("");
      return;
    }
    const memberId = verifyTarget.id;
    setVerifyTarget(null);
    setVerifyInput("");
    doSignIn(memberId);
  }

  function handleAccessToggle(
    memberId: string,
    currentlyHasFullAccess: boolean,
  ) {
    const member = staff.find((s) => s.id === memberId)!;
    const firstName = member.name.split(" ")[0];
    if (currentlyHasFullAccess) {
      Alert.alert(
        `Remove full access for ${firstName}?`,
        `${firstName} will go back to view-only mode and won't be able to edit functions or mark prep done.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove access",
            style: "destructive",
            onPress: () => {
              updateStaff(memberId, { accessLevel: undefined });
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            },
          },
        ],
      );
    } else {
      Alert.alert(
        `Grant full access to ${firstName}?`,
        `${firstName} will be able to edit functions and mark prep tasks as done, same as a manager.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Grant access",
            onPress: () => {
              updateStaff(memberId, { accessLevel: "manager" });
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            },
          },
        ],
      );
    }
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
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            },
          },
        ],
      );
    } else {
      markStaffSick(memberId, false);
    }
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    title: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    headerBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 20,
      marginBottom: 14,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      gap: 10,
      height: 44,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    clearBtn: { padding: 4 },
    statsRow: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 11,
      alignItems: "center",
    },
    statNum: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 9,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 2,
    },
    noResults: { alignItems: "center", paddingVertical: 40 },
    noResultsText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    rosterCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: "#161B22",
      borderColor: "rgba(255,255,255,0.08)",
      overflow: "hidden",
      borderLeftWidth: 4,
    },
    staffTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 14,
      borderBottomWidth: 1,
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    staffInfo: { flex: 1, gap: 2 },
    staffName: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    staffRoleText: { fontSize: 12, fontFamily: "Inter_500Medium" },
    staffNumText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
    teamBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
    },
    teamBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    leaderBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: "#22C55E20",
      borderWidth: 1,
      borderColor: "#22C55E40",
    },
    leaderBadgeText: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      color: "#22C55E",
    },
    sickBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: "#EF444420",
      borderWidth: 1,
      borderColor: "#EF444440",
    },
    sickBadgeText: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      color: "#EF4444",
    },
    rightActions: { alignItems: "flex-end", gap: 6 },
    shiftTime: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    actionBtnRow: { flexDirection: "row", gap: 6 },
    meBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    meBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    sickBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    sickBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    notifBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 10,
      backgroundColor: colors.accent + "20",
    },
    notifBadgeText: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      color: colors.accent,
    },
    timelineContainer: { paddingHorizontal: 14, paddingVertical: 10 },
    timelineHeader: { flexDirection: "row", marginBottom: 4 },
    hourLabel: {
      fontSize: 9,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    functionsSection: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
    funcBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
    },
    funcBadgeLeft: { flex: 1 },
    funcBadgeName: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    funcBadgeSub: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    funcTypePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    funcTypePillText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    // My Tasks section
    myTasksCard: {
      marginHorizontal: 20,
      marginBottom: 14,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      overflow: "hidden",
    },
    myTasksHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    myTasksTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold" },
    myTasksSubtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      marginTop: 1,
    },
    myInfoRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 6,
    },
    myInfoBlock: {
      flex: 1,
      minWidth: 100,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
    },
    myInfoLabel: {
      fontSize: 9,
      fontFamily: "Inter_700Bold",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    myInfoValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
    myInfoSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
    fnBlock: { borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
    fnBlockHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    fnTimeBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
    fnTimeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    fnName: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    fnDetailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    fnDetailChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 1,
    },
    fnDetailChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    fnTypePill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
    fnTypePillText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    prepSummaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingTop: 6,
      borderTopWidth: 1,
    },
    prepSummaryText: {
      flex: 1,
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    prepProgressBar: {
      height: 4,
      flex: 1,
      borderRadius: 2,
      backgroundColor: colors.border,
      overflow: "hidden",
    },
    prepProgressFill: { height: 4, borderRadius: 2 },
    sectionDividerLabel: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      color: "#484F58",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginHorizontal: 20,
      marginBottom: 8,
      marginTop: 20,
    },
    timelineBg: {
      height: 4,
      borderRadius: 2,
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#21262D",
    },
    shiftBar: { position: "absolute", height: 4, borderRadius: 2 },
    statusBadgeOnShift: {
      backgroundColor: "rgba(34,197,94,0.12)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(34,197,94,0.2)",
    },
    statusBadgeOnShiftText: { color: "#22C55E", fontSize: 11 },
    statusBadgeSick: {
      backgroundColor: "rgba(239,68,68,0.12)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.2)",
    },
    statusBadgeSickText: { color: "#EF4444", fontSize: 11 },
    addStaffBtn: {
      backgroundColor: "#3B82F6",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    addStaffBtnText: {
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      fontSize: 15,
    },
    sickAlertBanner: {
      backgroundColor: "rgba(239,68,68,0.08)",
      borderColor: "rgba(239,68,68,0.3)",
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 20,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    headerSickBadge: {
      backgroundColor: "rgba(239,68,68,0.12)",
      borderColor: "rgba(239,68,68,0.2)",
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    headerSickBadgeText: {
      color: "#EF4444",
      fontSize: 11,
      fontFamily: "Inter_700Bold",
    },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  const myMember = staff.find((s) => s.id === currentStaffId) ?? null;
  const myTeamColor = myMember?.section
    ? getTeamColor(myMember.section)
    : colors.primary;
  const myTeamLeader = myMember?.section
    ? (staff.find(
        (s) => s.teamLeadFor === myMember.section && s.id !== myMember.id,
      ) ?? null)
    : null;
  const myFunctions = myMember
    ? functions.filter((f) => myMember.functionIds.includes(f.id))
    : [];

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View>
                <Text style={s.title}>Roster</Text>
                <Text style={s.subtitle}>
                  {staff.length} staff today · {functions.length} functions
                </Text>
              </View>
              {sickCount > 0 && (
                <View style={s.headerSickBadge}>
                  <Text style={s.headerSickBadgeText}>{sickCount} SICK</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(isManager || staff.length === 0) && (
                <Pressable
                  style={({ pressed }) => [
                    s.headerBtn,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => router.push("/staff/new")}
                >
                  <Feather name="user-plus" size={15} color={colors.accent} />
                  <Text style={[s.headerBtnText, { color: colors.accent }]}>
                    Add
                  </Text>
                </Pressable>
              )}
              {(isManager || staff.length === 0) && (
                <Pressable
                  style={({ pressed }) => [
                    s.headerBtn,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => setShowSettings(true)}
                  accessibilityLabel="Settings"
                  accessibilityRole="button"
                >
                  <Feather
                    name="settings"
                    size={15}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              )}
            </View>
            <PrepFlowsLogo size={26} />
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
          <View>
            {sickCount > 0 && (
              <View
                style={{
                  marginHorizontal: 20,
                  marginBottom: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(239,68,68,0.25)",
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["rgba(239,68,68,0.14)", "rgba(249,115,22,0.04)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 16 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <Ionicons name="warning" size={15} color="#EF4444" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_700Bold",
                        color: "#EF4444",
                      }}
                    >
                      Coverage Alert
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: colors.foreground,
                      marginBottom: 10,
                      opacity: 0.9,
                    }}
                  >
                    {sickCount} staff call-in{sickCount > 1 ? "s" : ""} today —
                    shifts may be short
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_700Bold",
                      color: "#F97316",
                    }}
                  >
                    Review affected shifts →
                  </Text>
                </LinearGradient>
              </View>
            )}
            <View style={s.statsRow}>
              <GlassCard style={s.statCard}>
                <Text style={s.statNum}>{staff.length}</Text>
                <Text style={s.statLabel}>Total</Text>
              </GlassCard>
              <GlassCard
                style={s.statCard}
                accentColor={sickCount > 0 ? "#EF4444" : undefined}
              >
                <Text
                  style={[
                    s.statNum,
                    { color: sickCount > 0 ? "#EF4444" : colors.foreground },
                  ]}
                >
                  {sickCount}
                </Text>
                <Text style={s.statLabel}>Sick today</Text>
              </GlassCard>
              <GlassCard style={s.statCard} accentColor={colors.warning}>
                <Text style={[s.statNum, { color: colors.warning }]}>
                  {casualCount}
                </Text>
                <Text style={s.statLabel}>Casuals</Text>
              </GlassCard>
            </View>
          </View>
        )}

        {/* ── Daily Staff Brief QR — ONE code for ALL staff ─────────── */}
        {functions.length > 0 && search.length === 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              }}
            >
              <Ionicons
                name="qr-code-outline"
                size={15}
                color={colors.primary}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                }}
              >
                Daily Staff Brief
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                }}
              >
                — one scan for everyone
              </Text>
            </View>

            <GlassCard
              style={{
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: colors.primary + "50",
              }}
              accentColor={colors.primary}
            >
              {/* Info strip */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 14,
                  paddingBottom: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_700Bold",
                    color: colors.foreground,
                    marginBottom: 4,
                  }}
                >
                  Daily Staff Brief
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                    lineHeight: 18,
                  }}
                >
                  Show this to any casual staff. One scan — they see their name,
                  their team, and where to go.
                </Text>
              </View>

              {/* QR code — always visible */}
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 24,
                  backgroundColor: colors.background,
                }}
              >
                <View
                  style={{
                    padding: 18,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 18,
                  }}
                >
                  <QRCode
                    value={
                      Platform.OS === "web" && typeof window !== "undefined"
                        ? `${window.location.origin}/brief/today`
                        : "prepflows://brief/today"
                    }
                    size={210}
                    color="#0D1117"
                    backgroundColor="#FFFFFF"
                  />
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_500Medium",
                    color: colors.mutedForeground,
                    marginTop: 12,
                    textAlign: "center",
                  }}
                >
                  Scan with any phone camera
                </Text>
              </View>

              {/* Open button */}
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  backgroundColor: pressed
                    ? colors.primary + "15"
                    : "transparent",
                })}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/brief/today");
                }}
              >
                <Feather
                  name="external-link"
                  size={15}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_700Bold",
                    color: colors.primary,
                  }}
                >
                  Open daily brief
                </Text>
              </Pressable>
            </GlassCard>
          </View>
        )}

        {/* My Tasks card */}
        {myMember && search.length === 0 && (
          <>
            <Text style={s.sectionDividerLabel}>My shift today</Text>
            <GlassCard style={s.myTasksCard} accentColor={myTeamColor}>
              <View
                style={[
                  s.myTasksHeader,
                  {
                    borderBottomColor: myTeamColor + "30",
                    backgroundColor: myTeamColor + "12",
                  },
                ]}
              >
                <Ionicons name="person-circle" size={22} color={myTeamColor} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.myTasksTitle, { color: myTeamColor }]}>
                    {myMember.name}
                  </Text>
                  <Text
                    style={[
                      s.myTasksSubtitle,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {myMember.staffNumber} · {myMember.role}
                  </Text>
                </View>
                {notificationsEnabled && (
                  <View style={s.notifBadge}>
                    <Ionicons
                      name="notifications"
                      size={11}
                      color={colors.accent}
                    />
                    <Text style={s.notifBadgeText}>Reminders on</Text>
                  </View>
                )}
              </View>

              {/* Key info blocks */}
              <View style={s.myInfoRow}>
                {myMember.section && (
                  <View
                    style={[
                      s.myInfoBlock,
                      {
                        backgroundColor: myTeamColor + "15",
                        borderColor: myTeamColor + "40",
                      },
                    ]}
                  >
                    <Text style={[s.myInfoLabel, { color: myTeamColor }]}>
                      Your Team
                    </Text>
                    <Text style={[s.myInfoValue, { color: myTeamColor }]}>
                      {myMember.section}
                    </Text>
                    {myMember.teamLeadFor && (
                      <Text style={[s.myInfoSub, { color: myTeamColor }]}>
                        Team Leader
                      </Text>
                    )}
                  </View>
                )}
                {myTeamLeader && (
                  <View
                    style={[
                      s.myInfoBlock,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[s.myInfoLabel, { color: colors.mutedForeground }]}
                    >
                      Team Leader
                    </Text>
                    <Text style={[s.myInfoValue, { color: colors.foreground }]}>
                      {myTeamLeader.name.split(" ")[0]}
                    </Text>
                    <Text
                      style={[s.myInfoSub, { color: colors.mutedForeground }]}
                    >
                      {myTeamLeader.role}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    s.myInfoBlock,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[s.myInfoLabel, { color: colors.mutedForeground }]}
                  >
                    My Shift
                  </Text>
                  <Text style={[s.myInfoValue, { color: colors.foreground }]}>
                    {myMember.shiftStart}
                  </Text>
                  <Text
                    style={[s.myInfoSub, { color: colors.mutedForeground }]}
                  >
                    Finish {myMember.shiftEnd}
                  </Text>
                </View>
              </View>

              {/* Functions */}
              {myFunctions.map((fn) => {
                const ftc = getFunctionTypeColor(fn.functionType);
                const myTeamPrep = prepItems.filter(
                  (p) => p.functionId === fn.id && p.team === myMember.section,
                );
                const myTeamDone = myTeamPrep.filter((p) => p.completed).length;
                const prepPct =
                  myTeamPrep.length > 0 ? myTeamDone / myTeamPrep.length : 0;

                return (
                  <View
                    key={fn.id}
                    style={[s.fnBlock, { borderTopColor: myTeamColor + "25" }]}
                  >
                    <View style={s.fnBlockHeader}>
                      <View
                        style={[
                          s.fnTimeBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={s.fnTimeText}>{fn.startTime}</Text>
                      </View>
                      <Text style={s.fnName} numberOfLines={1}>
                        {fn.name}
                      </Text>
                      <View
                        style={[s.fnTypePill, { backgroundColor: ftc + "20" }]}
                      >
                        <Text style={[s.fnTypePillText, { color: ftc }]}>
                          {fn.functionType}
                        </Text>
                      </View>
                    </View>

                    <View style={s.fnDetailGrid}>
                      <View
                        style={[
                          s.fnDetailChip,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.secondary,
                          },
                        ]}
                      >
                        <Feather
                          name="map-pin"
                          size={11}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={[
                            s.fnDetailChipText,
                            { color: colors.foreground },
                          ]}
                        >
                          {fn.room}
                        </Text>
                      </View>
                      <View
                        style={[
                          s.fnDetailChip,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.secondary,
                          },
                        ]}
                      >
                        <Ionicons
                          name="layers"
                          size={11}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={[
                            s.fnDetailChipText,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {fn.floor}
                        </Text>
                      </View>
                      <View
                        style={[
                          s.fnDetailChip,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.secondary,
                          },
                        ]}
                      >
                        <Ionicons
                          name="people"
                          size={11}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={[
                            s.fnDetailChipText,
                            { color: colors.foreground },
                          ]}
                        >
                          {fn.guestCount} guests
                        </Text>
                      </View>
                      <View
                        style={[
                          s.fnDetailChip,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.secondary,
                          },
                        ]}
                      >
                        <Feather
                          name="clock"
                          size={11}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={[
                            s.fnDetailChipText,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {fn.startTime} – {fn.endTime}
                        </Text>
                      </View>
                    </View>

                    {myTeamPrep.length > 0 && (
                      <View
                        style={[
                          s.prepSummaryRow,
                          { borderTopColor: myTeamColor + "20" },
                        ]}
                      >
                        <Feather
                          name="clipboard"
                          size={13}
                          color={myTeamColor}
                        />
                        <Text style={s.prepSummaryText}>
                          {myMember.section} prep: {myTeamDone}/
                          {myTeamPrep.length} done
                        </Text>
                        <View style={s.prepProgressBar}>
                          <View
                            style={[
                              s.prepProgressFill,
                              {
                                width: `${prepPct * 100}%`,
                                backgroundColor:
                                  prepPct === 1 ? colors.accent : myTeamColor,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}

              {myFunctions.length === 0 && (
                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: colors.mutedForeground,
                    }}
                  >
                    No functions assigned yet for today.
                  </Text>
                </View>
              )}
            </GlassCard>
          </>
        )}

        {/* Staff list */}
        {search.length > 0 && (
          <Text style={s.sectionDividerLabel}>
            {filteredStaff.length} result{filteredStaff.length !== 1 ? "s" : ""}{" "}
            for "{search}"
          </Text>
        )}

        {filteredStaff.length === 0 && (
          <View style={s.noResults}>
            <Feather name="search" size={28} color={colors.mutedForeground} />
            <Text style={[s.noResultsText, { marginTop: 12 }]}>
              No staff found for "{search}"
            </Text>
          </View>
        )}

        <View
          style={
            isTablet
              ? { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8 }
              : {}
          }
        >
          {displayItems.map((item) => {
            if (item.type === "header") {
              return (
                <View
                  key={`hdr-${item.section}`}
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginHorizontal: 20,
                    marginTop: 20,
                    marginBottom: 8,
                    paddingRight: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Inter_700Bold",
                      color: colors.mutedForeground,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                    }}
                  >
                    {item.section}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {item.sickInSection > 0 && (
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_700Bold",
                          color: "#EF4444",
                        }}
                      >
                        {item.sickInSection} sick ·{" "}
                      </Text>
                    )}
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: colors.mutedForeground,
                      }}
                    >
                      {item.count} staff
                    </Text>
                  </View>
                </View>
              );
            }
            const member = item.member;
            const rc = getRoleColor(member.role);
            const tc = getTeamColor(member.section);
            const isMe = currentStaffId === member.id;
            const isLoading = loading === member.id;
            const isSick = sickStaffIds.includes(member.id);
            const memberAccessLevel = getAccessLevel(member);
            const hasFullAccess = memberAccessLevel === "manager";
            const isLeader = !!member.teamLeadFor;
            const shiftStart = timeToFloat(member.shiftStart);
            const shiftEnd = timeToFloat(member.shiftEnd);
            const leftPct = (shiftStart - minHour) / TOTAL_HOURS;
            const widthPct = (shiftEnd - shiftStart) / TOTAL_HOURS;
            const memberFunctions = functions.filter((f) =>
              member.functionIds.includes(f.id),
            );

            return (
              <View
                key={member.id}
                style={[
                  s.rosterCard,
                  isTablet && {
                    width: "50%",
                    marginHorizontal: 0,
                    paddingHorizontal: 4,
                  },
                  {
                    borderLeftColor: isSick ? "#EF4444" : rc,
                    borderStyle: isSick ? "dashed" : "solid",
                    opacity: isSick ? 0.8 : 1,
                  },
                ]}
              >
                {/* Glass body */}
                <LinearGradient
                  colors={["rgba(32,40,54,0.90)", "rgba(18,22,32,0.95)"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {/* Specular highlight */}
                <LinearGradient
                  colors={[
                    "rgba(255,255,255,0.13)",
                    "rgba(255,255,255,0.04)",
                    "rgba(255,255,255,0)",
                  ]}
                  locations={[0, 0.4, 1]}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.85, y: 0.5 }}
                  style={[StyleSheet.absoluteFill, { bottom: "65%" }]}
                />
                {/* Accent tint from role color */}
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: (isSick ? "#EF4444" : rc) + "10" },
                  ]}
                />
                <View
                  style={[
                    s.staffTopRow,
                    { borderBottomColor: "rgba(255,255,255,0.05)" },
                  ]}
                >
                  <View
                    style={[
                      s.avatar,
                      { backgroundColor: isSick ? "#EF444420" : rc },
                    ]}
                  >
                    <Text style={s.avatarText}>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  </View>
                  <View style={s.staffInfo}>
                    <Text
                      style={[
                        s.staffName,
                        isSick && {
                          textDecorationLine: "line-through",
                          color: colors.mutedForeground,
                        },
                      ]}
                    >
                      {member.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={[
                          s.staffRoleText,
                          { color: isSick ? "#EF4444" : rc },
                        ]}
                      >
                        {isSick ? "SICK — Called in" : member.role}
                      </Text>
                      {isMe && (
                        <View style={s.statusBadgeOnShift}>
                          <Text style={s.statusBadgeOnShiftText}>On Shift</Text>
                        </View>
                      )}
                      {isSick && (
                        <View style={s.statusBadgeSick}>
                          <Text style={s.statusBadgeSickText}>Sick</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.staffNumText}>{member.staffNumber}</Text>
                    <View style={s.badgesRow}>
                      {member.section && (
                        <View
                          style={[
                            s.teamBadge,
                            {
                              backgroundColor: tc + "20",
                              borderColor: tc + "40",
                            },
                          ]}
                        >
                          <Text style={[s.teamBadgeText, { color: tc }]}>
                            {member.section}
                          </Text>
                        </View>
                      )}
                      {isLeader && (
                        <View style={s.leaderBadge}>
                          <Ionicons
                            name="shield-checkmark"
                            size={9}
                            color="#22C55E"
                          />
                          <Text style={s.leaderBadgeText}>Team Lead</Text>
                        </View>
                      )}
                      {isSick && (
                        <View style={s.sickBadge}>
                          <Feather
                            name="alert-circle"
                            size={9}
                            color="#EF4444"
                          />
                          <Text style={s.sickBadgeText}>Absent today</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={s.rightActions}>
                    <Text style={s.shiftTime}>
                      {member.shiftStart}–{member.shiftEnd}
                    </Text>
                    <View style={s.actionBtnRow}>
                      {/* Edit — managers only */}
                      {isManager && (
                        <Pressable
                          style={({ pressed }) => [
                            s.sickBtn,
                            {
                              backgroundColor: "transparent",
                              borderColor: colors.border,
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                          onPress={() => router.push(`/staff/${member.id}`)}
                        >
                          <Feather
                            name="edit-2"
                            size={11}
                            color={colors.mutedForeground}
                          />
                          <Text
                            style={[
                              s.sickBtnText,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            Edit
                          </Text>
                        </Pressable>
                      )}
                      {/* Access toggle — managers only, not on themselves */}
                      {isManager && member.id !== currentStaffId && (
                        <Pressable
                          style={({ pressed }) => [
                            s.sickBtn,
                            {
                              backgroundColor: hasFullAccess
                                ? "#22C55E18"
                                : "transparent",
                              borderColor: hasFullAccess
                                ? "#22C55E"
                                : colors.border,
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                          onPress={() =>
                            handleAccessToggle(member.id, hasFullAccess)
                          }
                        >
                          <Ionicons
                            name={
                              hasFullAccess
                                ? "lock-open-outline"
                                : "lock-closed-outline"
                            }
                            size={11}
                            color={
                              hasFullAccess ? "#22C55E" : colors.mutedForeground
                            }
                          />
                          <Text
                            style={[
                              s.sickBtnText,
                              {
                                color: hasFullAccess
                                  ? "#22C55E"
                                  : colors.mutedForeground,
                              },
                            ]}
                          >
                            {hasFullAccess ? "Open" : "Locked"}
                          </Text>
                        </Pressable>
                      )}
                      {/* Sick call button — managers only, not on themselves */}
                      {isManager && member.id !== currentStaffId && (
                        <Pressable
                          style={({ pressed }) => [
                            s.sickBtn,
                            {
                              backgroundColor: isSick
                                ? "#EF444420"
                                : "transparent",
                              borderColor: isSick ? "#EF4444" : colors.border,
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                          onPress={() => handleSickToggle(member.id, isSick)}
                        >
                          <Feather
                            name={isSick ? "user-x" : "user-x"}
                            size={11}
                            color={isSick ? "#EF4444" : colors.mutedForeground}
                          />
                          <Text
                            style={[
                              s.sickBtnText,
                              {
                                color: isSick
                                  ? "#EF4444"
                                  : colors.mutedForeground,
                              },
                            ]}
                          >
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
                              opacity: pressed || isLoading ? 0.7 : 1,
                            },
                          ]}
                          onPress={() => handleSelectMe(member.id)}
                          disabled={isLoading}
                        >
                          {isMe ? (
                            <Feather name="check" size={11} color="#fff" />
                          ) : (
                            <Feather
                              name="user"
                              size={11}
                              color={colors.mutedForeground}
                            />
                          )}
                          <Text
                            style={[
                              s.meBtnText,
                              { color: isMe ? "#fff" : colors.mutedForeground },
                            ]}
                          >
                            {isLoading
                              ? "Setting…"
                              : isMe
                                ? "That's me"
                                : "This is me"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    {isMe && notificationsEnabled && (
                      <View style={s.notifBadge}>
                        <Ionicons
                          name="notifications"
                          size={10}
                          color={colors.accent}
                        />
                        <Text style={s.notifBadgeText}>Reminders on</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Shift timeline — managers only */}
                {isManager && !isSick && (
                  <View style={s.timelineContainer}>
                    <View style={s.timelineHeader}>
                      {HOURS.filter((_, i) => i % 2 === 0).map((h) => (
                        <Text
                          key={h}
                          style={[s.hourLabel, { width: HOUR_WIDTH * 2 }]}
                        >
                          {h}:00
                        </Text>
                      ))}
                    </View>
                    <View
                      style={[
                        s.timelineBg,
                        {
                          width: HOUR_WIDTH * TOTAL_HOURS,
                          backgroundColor: isMe ? rc + "20" : colors.secondary,
                        },
                      ]}
                    >
                      <View
                        style={[
                          s.shiftBar,
                          {
                            left: `${leftPct * 100}%`,
                            width: `${widthPct * 100}%`,
                            backgroundColor: rc,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* Functions — name only for non-managers */}
                {!isSick && memberFunctions.length > 0 && (
                  <View style={s.functionsSection}>
                    {memberFunctions.map((fn) => {
                      const ftc = getFunctionTypeColor(fn.functionType);
                      return (
                        <View
                          key={fn.id}
                          style={[
                            s.funcBadge,
                            {
                              backgroundColor: rc + "10",
                              borderColor: rc + "30",
                            },
                          ]}
                        >
                          <View style={s.funcBadgeLeft}>
                            <Text style={s.funcBadgeName} numberOfLines={1}>
                              {fn.name}
                            </Text>
                            {isManager && (
                              <Text style={s.funcBadgeSub}>
                                {fn.room} · {fn.floor} · {fn.guestCount} guests
                                · {fn.startTime}
                              </Text>
                            )}
                          </View>
                          <View
                            style={[
                              s.funcTypePill,
                              { backgroundColor: ftc + "20" },
                            ]}
                          >
                            <Text style={[s.funcTypePillText, { color: ftc }]}>
                              {fn.startTime}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Sick — shift coverage notice */}
                {isSick && isManager && (
                  <View
                    style={{
                      paddingHorizontal: 14,
                      paddingBottom: 12,
                      paddingTop: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_500Medium",
                        color: "#EAB308",
                      }}
                    >
                      Shift uncovered · Find replacement
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Empty state */}
        {staff.length === 0 && search.length === 0 && (
          <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
            <Feather name="users" size={40} color={colors.mutedForeground} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
              }}
            >
              No staff yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                textAlign: "center",
              }}
            >
              {isManager
                ? 'Tap "Add" to add your first team member, or load sample data from settings.'
                : "A manager can add staff from this screen."}
            </Text>
            <Pressable
              style={s.addStaffBtn}
              onPress={() => router.push("/staff/new")}
            >
              <Feather name="user-plus" size={16} color="#fff" />
              <Text style={s.addStaffBtnText}>Add first staff member</Text>
            </Pressable>
          </View>
        )}

        <View style={s.bottomPad} />
      </ScrollView>

      {/* Identity verification Modal */}
      <Modal
        visible={verifyTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setVerifyTarget(null);
          setVerifyInput("");
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "#00000070",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
          onPress={() => {
            setVerifyTarget(null);
            setVerifyInput("");
          }}
        >
          <Pressable
            style={{
              width: "100%",
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}
            onPress={() => {}}
          >
            <View style={{ padding: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.primary + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_700Bold",
                      color: colors.foreground,
                    }}
                  >
                    Confirm your identity
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: colors.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    Signing in as {verifyTarget?.name}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                  marginBottom: 16,
                  lineHeight: 20,
                }}
              >
                {verifyTarget ? verificationHint(verifyTarget) : ""}
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.foreground,
                  letterSpacing: 4,
                  marginBottom: 16,
                }}
                value={verifyInput}
                onChangeText={setVerifyInput}
                placeholder="—"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                keyboardType="default"
                autoFocus
                maxLength={20}
                onSubmitEditing={handleVerifyConfirm}
                returnKeyType="done"
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    opacity: pressed ? 0.7 : 1,
                  })}
                  onPress={() => {
                    setVerifyTarget(null);
                    setVerifyInput("");
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: colors.mutedForeground,
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => ({
                    flex: 2,
                    paddingVertical: 13,
                    borderRadius: 10,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                  onPress={handleVerifyConfirm}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_700Bold",
                      color: "#fff",
                    }}
                  >
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "#00000060" }}
          onPress={() => setShowSettings(false)}
        />
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: colors.foreground,
              marginBottom: 4,
            }}
          >
            Settings & Data
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_400Regular",
              color: colors.mutedForeground,
              marginBottom: 16,
            }}
          >
            Manage staff, app data and reset options
          </Text>

          {/* Theme picker */}
          <View
            style={{
              marginBottom: 18,
              padding: 14,
              borderRadius: 14,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
                color: colors.foreground,
                marginBottom: 12,
              }}
            >
              App Theme
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {THEME_OPTIONS.map(({ name, label, bg, dot }) => {
                const active = themeName === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setThemeName(name);
                    }}
                    style={{ alignItems: "center", gap: 6 }}
                  >
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        backgroundColor: bg,
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? "#FFFFFF" : bg + "60",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: dot,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: active
                          ? "Inter_600SemiBold"
                          : "Inter_400Regular",
                        color: active
                          ? colors.foreground
                          : colors.mutedForeground,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Watch notification info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.accent + "10",
              borderWidth: 1,
              borderColor: colors.accent + "30",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="watch-outline"
              size={18}
              color={colors.accent}
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_700Bold",
                  color: colors.accent,
                  marginBottom: 2,
                }}
              >
                Apple Watch & Samsung Watch
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                  lineHeight: 17,
                }}
              >
                When you tap "This is me" and turn on reminders, alerts appear
                on your watch automatically — 60 min, 30 min, 15 min before
                service, plus a fire reminder for each course. No phone in hand
                needed during service.
              </Text>
            </View>
          </View>

          {/* Management Dashboard */}
          {isManager && (
            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#8B5CF650",
                backgroundColor: "#8B5CF608",
                marginBottom: 10,
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={() => {
                setShowSettings(false);
                router.push("/manage");
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#8B5CF620",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="settings" size={18} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_600SemiBold",
                    color: "#8B5CF6",
                  }}
                >
                  Management Dashboard
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                  }}
                >
                  Functions · Roster · Access control
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>
          )}

          {/* Subscription */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.primary + "50",
              backgroundColor: colors.primary + "08",
              marginBottom: 10,
              opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => {
              setShowSettings(false);
              router.push("/subscribe");
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="rocket-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.primary,
                }}
              >
                Plans & Pricing
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                }}
              >
                First month free · Starter, Pro $49, Team $199
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>

          {/* View the Plan — opens PrepFlows website */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 12,
              marginBottom: 10,
              opacity: pressed ? 0.82 : 1,
              overflow: "hidden",
            })}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowSettings(false);
              const url =
                Platform.OS === "web"
                  ? `${window.location.origin}/prepflows-website/pricing`
                  : "https://prepflows.com/pricing";
              Linking.openURL(url);
            }}
          >
            {/* Gradient background via nested Views */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 12,
                backgroundColor: "#3B82F6",
                shadowColor: "#3B82F6",
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            />
            {/* Cyan overlay for gradient feel */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "55%",
                borderRadius: 12,
                backgroundColor: "#06B6D4",
                opacity: 0.55,
              }}
            />

            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <Ionicons name="open-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, zIndex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_700Bold",
                  color: "#FFFFFF",
                }}
              >
                View the Plan
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Manage your plan, billing & settings on prepflows.com
              </Text>
            </View>
            <View style={{ zIndex: 1 }}>
              <Feather
                name="arrow-right"
                size={18}
                color="rgba(255,255,255,0.9)"
              />
            </View>
          </Pressable>

          {/* Import Events */}
          {isManager && (
            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#22C55E50",
                backgroundColor: "#22C55E08",
                marginBottom: 10,
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={() => {
                setShowSettings(false);
                router.push("/import-events");
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#22C55E20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="upload-cloud" size={18} color="#22C55E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_600SemiBold",
                    color: "#22C55E",
                  }}
                >
                  Import Events
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                  }}
                >
                  XLSX · CSV · Moments Explorer · Delphi · Opera
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>
          )}

          {/* Function Rooms */}
          {isManager && (
            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#F59E0B50",
                backgroundColor: "#F59E0B08",
                marginBottom: 10,
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={() => {
                setShowSettings(false);
                router.push("/rooms");
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#F59E0B20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="business-outline" size={18} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_600SemiBold",
                    color: "#F59E0B",
                  }}
                >
                  Function Rooms
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                  }}
                >
                  Manage rooms, capacities & setup notes
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>
          )}

          {/* Manage staff */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              marginBottom: 10,
              opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => {
              setShowSettings(false);
              router.push("/staff/new");
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.accent + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="user-plus" size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.foreground,
                }}
              >
                Add Staff Member
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                }}
              >
                Add a new person to your roster
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>

          {/* Reset to sample */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#F59E0B40",
              backgroundColor: "#F59E0B08",
              marginBottom: 10,
              opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => {
              setShowSettings(false);
              Alert.alert(
                "Load Sample Data?",
                "This will replace all current staff, functions and prep lists with the built-in demo data. Your changes will be lost.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Load sample data",
                    onPress: () => {
                      resetToSampleData();
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                    },
                  },
                ],
              );
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#F59E0B20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="refresh-cw" size={18} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F59E0B",
                }}
              >
                Load Sample Data
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                }}
              >
                Restore demo staff, functions and prep lists
              </Text>
            </View>
          </Pressable>

          {/* Clear all */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#EF444440",
              backgroundColor: "#EF444408",
              opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => {
              setShowSettings(false);
              Alert.alert(
                "Clear All Data?",
                "This will permanently delete all staff, functions, prep lists and your sign-in. You will start with a blank slate.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear everything",
                    style: "destructive",
                    onPress: () => {
                      clearAllData();
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Warning,
                      );
                    },
                  },
                ],
              );
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#EF444420",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="trash-2" size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_600SemiBold",
                  color: "#EF4444",
                }}
              >
                Clear All Data
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                }}
              >
                Start fresh with a blank app — cannot be undone
              </Text>
            </View>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
