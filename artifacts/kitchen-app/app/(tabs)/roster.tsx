import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

const HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const TOTAL_HOURS = HOURS.length;
const HOUR_WIDTH = 44;

function timeToFloat(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

export default function RosterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { staff, functions } = useKitchen();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const minHour = HOURS[0];

  function getRoleColor(role: string) {
    switch (role) {
      case "Head Chef": return colors.primary;
      case "Sous Chef": return colors.info;
      case "Pastry Chef": return "#A78BFA";
      case "Casual": return colors.warning;
      default: return colors.mutedForeground;
    }
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case "Head Chef": return "star";
      case "Sous Chef": return "award";
      case "Pastry Chef": return "gift";
      case "Casual": return "user";
      default: return "user";
    }
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16 },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      alignItems: "center",
    },
    statNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 },
    rosterCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    staffRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    roleIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    staffName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    staffRole: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    shiftTime: { marginLeft: "auto" as const, fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    timelineContainer: { paddingHorizontal: 14, paddingVertical: 12 },
    timelineHeader: { flexDirection: "row", marginBottom: 6 },
    hourLabel: { width: HOUR_WIDTH, fontSize: 9, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center" },
    timelineBg: { height: 12, backgroundColor: colors.secondary, borderRadius: 6, marginBottom: 8, position: "relative" },
    shiftBar: {
      position: "absolute",
      height: 12,
      borderRadius: 6,
      opacity: 0.9,
    },
    functionsSection: {
      paddingHorizontal: 14,
      paddingBottom: 12,
      gap: 6,
    },
    funcBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
    },
    funcBadgeText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium" },
    funcBadgeRoom: { fontSize: 11, fontFamily: "Inter_400Regular" },
    casualHighlight: {
      marginHorizontal: 14,
      marginBottom: 12,
      padding: 10,
      backgroundColor: colors.warning + "18",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.warning + "40",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    casualText: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.warning, flex: 1 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  const casualCount = staff.filter((s) => s.role === "Casual").length;
  const totalHoursWorked = staff.reduce((sum, s) => {
    return sum + (timeToFloat(s.shiftEnd) - timeToFloat(s.shiftStart));
  }, 0);

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Roster</Text>
          <Text style={s.subtitle}>{staff.length} staff on today</Text>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{staff.length}</Text>
            <Text style={s.statLabel}>Total Staff</Text>
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

        {staff.map((member) => {
          const rc = getRoleColor(member.role);
          const shiftStart = timeToFloat(member.shiftStart);
          const shiftEnd = timeToFloat(member.shiftEnd);
          const leftPct = ((shiftStart - minHour) / TOTAL_HOURS);
          const widthPct = ((shiftEnd - shiftStart) / TOTAL_HOURS);
          const memberFunctions = functions.filter((f) => member.functionIds.includes(f.id));
          const isCasual = member.role === "Casual";

          return (
            <View key={member.id} style={s.rosterCard}>
              <View style={s.staffRow}>
                <View style={[s.roleIcon, { backgroundColor: rc + "25" }]}>
                  <Feather name={getRoleIcon(member.role) as any} size={14} color={rc} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.staffName}>{member.name}</Text>
                  <Text style={[s.staffRole, { color: rc }]}>{member.role}</Text>
                </View>
                <Text style={s.shiftTime}>{member.shiftStart} – {member.shiftEnd}</Text>
              </View>

              <View style={s.timelineContainer}>
                <View style={s.timelineHeader}>
                  {HOURS.filter((_, i) => i % 2 === 0).map((h) => (
                    <Text key={h} style={[s.hourLabel, { width: HOUR_WIDTH * 2 }]}>{h}:00</Text>
                  ))}
                </View>
                <View style={[s.timelineBg, { width: HOUR_WIDTH * TOTAL_HOURS }]}>
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

              {isCasual && memberFunctions.length > 0 && (
                <View style={s.casualHighlight}>
                  <Ionicons name="location" size={15} color={colors.warning} />
                  <Text style={s.casualText}>
                    Report to {memberFunctions.map(f => f.room).join(", ")} at {memberFunctions[0].startTime}
                  </Text>
                </View>
              )}

              {memberFunctions.length > 0 && (
                <View style={s.functionsSection}>
                  {memberFunctions.map((fn) => (
                    <View
                      key={fn.id}
                      style={[s.funcBadge, { backgroundColor: rc + "15", borderColor: rc + "35" }]}
                    >
                      <Feather name="clock" size={12} color={rc} />
                      <Text style={[s.funcBadgeText, { color: colors.foreground }]} numberOfLines={1}>{fn.name}</Text>
                      <Text style={[s.funcBadgeRoom, { color: colors.mutedForeground }]}>{fn.room} · {fn.startTime}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
