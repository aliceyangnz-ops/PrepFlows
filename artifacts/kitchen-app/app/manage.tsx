import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ACCESS_LEVEL_LABELS,
  AccessLevel,
  KitchenFunction,
  PrepItem,
  StaffMember,
  getAccessLevel,
  useKitchen,
} from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

type ManageTab = "overview" | "functions" | "roster" | "access";

const ACCESS_OPTIONS: AccessLevel[] = ["manager", "team_leader", "staff"];
const ACCESS_COLORS: Record<AccessLevel, string> = {
  manager: "#EAB308",
  team_leader: "#3B82F6",
  staff: "#22C55E",
};

export default function ManageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    functions,
    staff,
    prepItems,
    sickStaffIds,
    currentStaffId,
    updateStaff,
    deleteFunction,
  } = useKitchen();

  const [tab, setTab] = useState<ManageTab>("overview");
  const topPad = Platform.OS === "web" ? 0 : insets.top;

  /* Access guard */
  const currentMember = staff.find((m) => m.id === currentStaffId) ?? null;
  const isManager = currentMember
    ? getAccessLevel(currentMember) === "manager"
    : false;

  /* Derived counts */
  const totalGuests = functions.reduce((n, f) => n + f.guestCount, 0);
  const prepDone = prepItems.filter((p) => p.completed).length;
  const prepTotal = prepItems.length;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    /* Top bar */
    topBar: {
      backgroundColor: "#0D1117",
      paddingTop: topPad + (Platform.OS === "web" ? 0 : 12),
      paddingBottom: 0,
      borderBottomWidth: 1,
      borderBottomColor: "#242938",
    },
    topBarInner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 12,
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "#ffffff12",
      alignItems: "center",
      justifyContent: "center",
    },
    topTitle: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      flex: 1,
    },
    topSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },
    managerBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: "#EAB308",
      alignItems: "center",
    },
    managerBadgeText: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    /* Tab bar */
    tabBar: {
      flexDirection: "row",
      backgroundColor: "#0D1117",
      paddingHorizontal: 16,
      paddingBottom: 0,
    },
    tabBtn: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabBtnActive: { borderBottomColor: "#EAB308" },
    tabText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#64748B",
    },
    tabTextActive: { color: "#EAB308" },
    /* Body */
    body: { flex: 1 },
    pad: { padding: 16 },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 8,
      marginTop: 4,
    },
    /* Cards */
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      overflow: "hidden",
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    cardRowLast: { borderBottomWidth: 0 },
    rowLabel: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      flex: 1,
    },
    rowSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    rowValue: {
      fontSize: 13,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    /* Stat grid */
    statGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 16,
    },
    statBox: {
      flex: 1,
      minWidth: 130,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    statNum: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    /* Access pill */
    accessPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    accessPillText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    /* Btn */
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
    },
    actionBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    /* No access */
    noAccess: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
  });

  /* ── Access guard screen ──────────────────────────────────────── */
  if (!isManager) {
    return (
      <View style={[s.root, s.noAccess]}>
        <Ionicons name="lock-closed" size={48} color={colors.border} />
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_700Bold",
            color: colors.foreground,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Management Only
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: colors.mutedForeground,
            textAlign: "center",
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          This dashboard is for managers and head chefs only.{"\n"}
          Sign in as yourself on the Roster tab first.
        </Text>
        <Pressable
          style={({ pressed }) => ({
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.8 : 1,
          })}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={16} color="#fff" />
          <Text
            style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" }}
          >
            Go to Roster
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ── Overview tab ─────────────────────────────────────────────── */
  const OverviewTab = () => (
    <ScrollView
      style={s.body}
      contentContainerStyle={s.pad}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.sectionLabel}>Today at a Glance</Text>
      <View style={s.statGrid}>
        <View style={s.statBox}>
          <Text style={[s.statNum, { color: colors.primary }]}>
            {functions.length}
          </Text>
          <Text style={s.statLabel}>Functions today</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statNum}>{totalGuests}</Text>
          <Text style={s.statLabel}>Total guests</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statNum, { color: colors.accent }]}>
            {staff.length}
          </Text>
          <Text style={s.statLabel}>Staff on</Text>
        </View>
        <View style={s.statBox}>
          <Text
            style={[
              s.statNum,
              {
                color: sickStaffIds.length > 0 ? "#EF4444" : colors.foreground,
              },
            ]}
          >
            {sickStaffIds.length}
          </Text>
          <Text style={s.statLabel}>Called sick</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statNum, { color: "#F59E0B" }]}>
            {prepTotal > 0 ? Math.round((prepDone / prepTotal) * 100) : 0}%
          </Text>
          <Text style={s.statLabel}>Prep complete</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statNum, { color: "#8B5CF6" }]}>
            {prepDone}/{prepTotal}
          </Text>
          <Text style={s.statLabel}>Prep items done</Text>
        </View>
      </View>

      <Text style={s.sectionLabel}>Functions</Text>
      <View style={s.card}>
        {functions.map((fn, idx) => (
          <Pressable
            key={fn.id}
            style={({ pressed }) => [
              s.cardRow,
              idx === functions.length - 1 && s.cardRowLast,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push(`/function/${fn.id}`)}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel} numberOfLines={1}>
                {fn.name}
              </Text>
              <Text style={s.rowSub}>
                {fn.room} · {fn.startTime}–{fn.endTime} · {fn.guestCount} guests
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: colors.primary + "15",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.primary,
                }}
              >
                {fn.functionType}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={15}
              color={colors.mutedForeground}
            />
          </Pressable>
        ))}
        {functions.length === 0 && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
              }}
            >
              No functions today.
            </Text>
          </View>
        )}
      </View>

      <Text style={s.sectionLabel}>Quick Actions</Text>
      <View style={s.card}>
        {[
          {
            icon: "plus-circle" as const,
            label: "Add new function",
            sub: "Schedule a new event or booking",
            onPress: () => router.push("/function/add"),
          },
          {
            icon: "user-plus" as const,
            label: "Add staff member",
            sub: "Add to the roster",
            onPress: () => router.push("/staff/new"),
          },
          {
            icon: "clipboard" as const,
            label: "View prep list",
            sub: "All teams, all functions",
            onPress: () => router.push("/(tabs)/prep"),
          },
          {
            icon: "bar-chart-2" as const,
            label: "Analytics",
            sub: "Weekly completion rates and trends",
            onPress: () => router.push("/analytics"),
          },
          {
            icon: "dollar-sign" as const,
            label: "Plans & pricing",
            sub: "$49 or $199/month — first month free",
            onPress: () => router.push("/subscribe"),
          },
        ].map(({ icon, label, sub, onPress }, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [
              s.cardRow,
              idx === 4 && s.cardRowLast,
              pressed && { opacity: 0.7 },
            ]}
            onPress={onPress}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.primary + "15",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name={icon} size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>{label}</Text>
              <Text style={s.rowSub}>{sub}</Text>
            </View>
            <Feather
              name="chevron-right"
              size={15}
              color={colors.mutedForeground}
            />
          </Pressable>
        ))}
      </View>

      <View
        style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 40 }}
      />
    </ScrollView>
  );

  /* ── Functions tab ────────────────────────────────────────────── */
  const FunctionsTab = () => (
    <ScrollView
      style={s.body}
      contentContainerStyle={s.pad}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          paddingVertical: 13,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
        })}
        onPress={() => router.push("/function/add")}
      >
        <Feather name="plus" size={18} color="#fff" />
        <Text
          style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" }}
        >
          Add New Function
        </Text>
      </Pressable>

      {functions.map((fn) => {
        const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
        const fnPrepDone = fnPrep.filter((p) => p.completed).length;
        return (
          <View key={fn.id} style={[s.card, { marginBottom: 12 }]}>
            <View
              style={{
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: colors.primary + "08",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_700Bold",
                  color: colors.foreground,
                }}
              >
                {fn.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                  marginTop: 3,
                }}
              >
                {fn.room} · {fn.floor} · {fn.startTime}–{fn.endTime} ·{" "}
                {fn.guestCount} guests · {fn.functionType}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                padding: 14,
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <View style={{ flex: 1, minWidth: 80 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                  }}
                >
                  Staff assigned
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_700Bold",
                    color: colors.foreground,
                  }}
                >
                  {fn.teamIds.length}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 80 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                  }}
                >
                  Dietary
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_700Bold",
                    color:
                      fn.dietaryRequirements.length > 0
                        ? "#F59E0B"
                        : colors.foreground,
                  }}
                >
                  {fn.dietaryRequirements.reduce((n, r) => n + r.count, 0)}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 80 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                  }}
                >
                  Prep done
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_700Bold",
                    color: colors.accent,
                  }}
                >
                  {fnPrepDone}/{fnPrep.length}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingHorizontal: 14,
                paddingBottom: 14,
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  s.actionBtn,
                  {
                    flex: 1,
                    justifyContent: "center",
                    borderColor: colors.primary + "50",
                    backgroundColor: colors.primary + "10",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => router.push(`/function/${fn.id}`)}
              >
                <Feather name="edit-3" size={14} color={colors.primary} />
                <Text style={[s.actionBtnText, { color: colors.primary }]}>
                  Open & Edit
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  s.actionBtn,
                  {
                    borderColor: "#EF444450",
                    backgroundColor: "#EF444410",
                    opacity: pressed ? 0.7 : 1,
                    paddingHorizontal: 14,
                  },
                ]}
                onPress={() => {
                  Alert.alert(
                    "Delete Function",
                    `Delete "${fn.name}"? This cannot be undone.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Heavy,
                          );
                          deleteFunction(fn.id);
                        },
                      },
                    ],
                  );
                }}
              >
                <Feather name="trash-2" size={14} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        );
      })}

      {functions.length === 0 && (
        <View style={[s.card, { padding: 24, alignItems: "center" }]}>
          <Feather name="calendar" size={32} color={colors.border} />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: colors.mutedForeground,
              marginTop: 12,
            }}
          >
            No functions scheduled.
          </Text>
        </View>
      )}
      <View
        style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 40 }}
      />
    </ScrollView>
  );

  /* ── Roster tab ───────────────────────────────────────────────── */
  const RosterTab = () => (
    <ScrollView
      style={s.body}
      contentContainerStyle={s.pad}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          paddingVertical: 13,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: colors.accent,
          opacity: pressed ? 0.85 : 1,
        })}
        onPress={() => router.push("/staff/new")}
      >
        <Feather name="user-plus" size={18} color="#fff" />
        <Text
          style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" }}
        >
          Add Staff Member
        </Text>
      </Pressable>

      {staff.map((member) => {
        const level = getAccessLevel(member);
        const tc = ACCESS_COLORS[level];
        const isSick = sickStaffIds.includes(member.id);
        return (
          <Pressable
            key={member.id}
            style={({ pressed }) => [
              s.cardRow,
              s.card,
              { marginBottom: 8, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push(`/staff/${member.id}`)}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: tc + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: tc }}
              >
                {member.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={s.rowLabel} numberOfLines={1}>
                  {member.name}
                </Text>
                {isSick && (
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      backgroundColor: "#EF444420",
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_700Bold",
                        color: "#EF4444",
                      }}
                    >
                      SICK
                    </Text>
                  </View>
                )}
              </View>
              <Text style={s.rowSub}>
                {member.role} · {member.staffNumber} · {member.shiftStart}–
                {member.shiftEnd}
              </Text>
            </View>
            <View style={[s.accessPill, { backgroundColor: tc + "20" }]}>
              <Text style={[s.accessPillText, { color: tc }]}>
                {level === "manager"
                  ? "MGMT"
                  : level === "team_leader"
                    ? "LEAD"
                    : "STAFF"}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={14}
              color={colors.mutedForeground}
            />
          </Pressable>
        );
      })}
      <View
        style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 40 }}
      />
    </ScrollView>
  );

  /* ── Access Control tab ───────────────────────────────────────── */
  const AccessTab = () => (
    <ScrollView
      style={s.body}
      contentContainerStyle={s.pad}
      showsVerticalScrollIndicator={false}
    >
      <View style={[s.card, { marginBottom: 16, padding: 14 }]}>
        <View
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
        >
          <Ionicons
            name="information-circle"
            size={18}
            color={colors.primary}
            style={{ marginTop: 1 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                marginBottom: 4,
              }}
            >
              How access levels work
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                lineHeight: 18,
              }}
            >
              <Text style={{ fontFamily: "Inter_700Bold", color: "#EAB308" }}>
                Management
              </Text>{" "}
              — full access: add/edit/delete functions, manage roster, adjust
              all settings.{"\n"}
              <Text style={{ fontFamily: "Inter_700Bold", color: "#3B82F6" }}>
                Team Leader
              </Text>{" "}
              — can edit service times, dietary notes, and run-sheet items.
              {"\n"}
              <Text style={{ fontFamily: "Inter_700Bold", color: "#22C55E" }}>
                Staff
              </Text>{" "}
              — view only. No changes to the app.
            </Text>
          </View>
        </View>
      </View>

      <Text style={s.sectionLabel}>Staff Access Levels — Tap to Change</Text>

      {staff.map((member) => {
        const current = getAccessLevel(member);
        const tc = ACCESS_COLORS[current];
        return (
          <View key={member.id} style={[s.card, { marginBottom: 10 }]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: tc + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_700Bold",
                    color: tc,
                  }}
                >
                  {member.name.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_700Bold",
                    color: colors.foreground,
                  }}
                >
                  {member.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                  }}
                >
                  {member.role} · {member.staffNumber}
                </Text>
              </View>
              <View style={[s.accessPill, { backgroundColor: tc + "20" }]}>
                <Text style={[s.accessPillText, { color: tc }]}>
                  {ACCESS_LEVEL_LABELS[current]}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, padding: 12 }}>
              {ACCESS_OPTIONS.map((level) => {
                const isActive = current === level;
                const lc = ACCESS_COLORS[level];
                return (
                  <Pressable
                    key={level}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: "center",
                      paddingVertical: 10,
                      borderRadius: 10,
                      borderWidth: 1.5,
                      borderColor: isActive ? lc : colors.border,
                      backgroundColor: isActive ? lc + "15" : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    })}
                    onPress={() => {
                      if (isActive) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateStaff(member.id, { accessLevel: level });
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: isActive
                          ? "Inter_700Bold"
                          : "Inter_400Regular",
                        color: isActive ? lc : colors.mutedForeground,
                      }}
                    >
                      {level === "manager"
                        ? "Manager"
                        : level === "team_leader"
                          ? "Team Lead"
                          : "Staff"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
      <View
        style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 40 }}
      />
    </ScrollView>
  );

  return (
    <View style={s.root}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.topBarInner}>
          <Pressable
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={16} color="#FFFFFF" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.topTitle}>Management Dashboard</Text>
            {currentMember && (
              <Text style={s.topSub}>
                {currentMember.name} · {currentMember.role}
              </Text>
            )}
          </View>
          <View style={s.managerBadge}>
            <Text style={s.managerBadgeText}>MANAGER</Text>
          </View>
        </View>

        {/* Tab bar */}
        <View style={s.tabBar}>
          {(["overview", "functions", "roster", "access"] as ManageTab[]).map(
            (t) => (
              <Pressable
                key={t}
                style={[s.tabBtn, tab === t && s.tabBtnActive]}
                onPress={() => {
                  setTab(t);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                  {t === "overview"
                    ? "Overview"
                    : t === "functions"
                      ? "Functions"
                      : t === "roster"
                        ? "Roster"
                        : "Access"}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      </View>

      {tab === "overview" && <OverviewTab />}
      {tab === "functions" && <FunctionsTab />}
      {tab === "roster" && <RosterTab />}
      {tab === "access" && <AccessTab />}
    </View>
  );
}
