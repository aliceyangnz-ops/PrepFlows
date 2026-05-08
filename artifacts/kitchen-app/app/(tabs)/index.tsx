import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getRoleColor(role: string, colors: ReturnType<typeof useColors>) {
  switch (role) {
    case "Head Chef": return colors.primary;
    case "Sous Chef": return colors.info;
    case "Pastry Chef": return "#A78BFA";
    case "Casual": return colors.warning;
    default: return colors.mutedForeground;
  }
}

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { functions, prepItems, staff, todayDate, currentStaffId, notificationsEnabled } = useKitchen();

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const myFunctions = currentMember
    ? functions.filter((f) => currentMember.functionIds.includes(f.id))
    : [];

  const totalPrep = prepItems.length;
  const completedPrep = prepItems.filter((p) => p.completed).length;
  const prepPercent = totalPrep > 0 ? completedPrep / totalPrep : 0;

  const nextFunction = useMemo(() => {
    const pool = currentMember ? myFunctions : functions;
    return pool
      .filter((f) => timeToMinutes(f.startTime) > nowMinutes)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0];
  }, [functions, myFunctions, currentMember, nowMinutes]);

  const minutesUntilNext = nextFunction
    ? timeToMinutes(nextFunction.startTime) - nowMinutes
    : null;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: currentMember ? 8 : 16,
    },
    dateLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" },
    headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2 },
    myDayCard: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: colors.radius,
      borderWidth: 1,
      overflow: "hidden",
    },
    myDayHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    myDayAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    myDayAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
    myDayName: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    myDayRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    notifPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    notifPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    myDayDivider: { height: 1 },
    myDayFunctions: { padding: 12, gap: 8 },
    myFnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    myFnTime: { fontSize: 13, fontFamily: "Inter_700Bold" },
    myFnName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    myFnRoom: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    alertBanner: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: colors.radius,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
    },
    alertText: { flex: 1 },
    alertTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    alertSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 1.2, textTransform: "uppercase", marginHorizontal: 20, marginBottom: 10 },
    progressCard: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    progressLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    progressCount: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
    functionCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    functionRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    functionTime: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary, width: 52 },
    functionName: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    functionMeta: { flexDirection: "row", gap: 10, alignItems: "center", flexWrap: "wrap" },
    metaChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.secondary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    metaText: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    teamRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
    avatar: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    avatarText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.dateLabel}>{todayDate}</Text>
          <Text style={s.headerTitle}>Today's Service</Text>
        </View>

        {currentMember && (() => {
          const rc = getRoleColor(currentMember.role, colors);
          return (
            <View style={[s.myDayCard, { backgroundColor: rc + "10", borderColor: rc + "40" }]}>
              <View style={s.myDayHeader}>
                <View style={[s.myDayAvatar, { backgroundColor: rc + "30" }]}>
                  <Text style={[s.myDayAvatarText, { color: rc }]}>
                    {currentMember.name.split(" ").map((n) => n[0]).join("")}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.myDayName}>{currentMember.name}</Text>
                  <Text style={[s.myDayRole, { color: rc }]}>
                    {currentMember.role} · {currentMember.shiftStart}–{currentMember.shiftEnd}
                  </Text>
                </View>
                <View style={[s.notifPill, { backgroundColor: notificationsEnabled ? colors.accent + "20" : colors.secondary }]}>
                  <Ionicons
                    name={notificationsEnabled ? "notifications" : "notifications-off"}
                    size={12}
                    color={notificationsEnabled ? colors.accent : colors.mutedForeground}
                  />
                  <Text style={[s.notifPillText, { color: notificationsEnabled ? colors.accent : colors.mutedForeground }]}>
                    {notificationsEnabled ? "Alerts on" : "No alerts"}
                  </Text>
                </View>
              </View>

              {myFunctions.length > 0 && (
                <>
                  <View style={[s.myDayDivider, { backgroundColor: rc + "30" }]} />
                  <View style={s.myDayFunctions}>
                    {myFunctions.map((fn) => (
                      <Pressable
                        key={fn.id}
                        style={({ pressed }) => [
                          s.myFnRow,
                          { backgroundColor: rc + "12", borderColor: rc + "30" },
                          pressed && { opacity: 0.8 },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/function/${fn.id}`);
                        }}
                      >
                        <Text style={[s.myFnTime, { color: rc }]}>{fn.startTime}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.myFnName} numberOfLines={1}>{fn.name}</Text>
                          <Text style={s.myFnRoom}>{fn.room} · {fn.guestCount} guests</Text>
                        </View>
                        <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        })()}

        {nextFunction && minutesUntilNext !== null && minutesUntilNext < 120 && (
          <View style={[s.alertBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View style={s.alertText}>
              <Text style={[s.alertTitle, { color: colors.primary }]}>
                {minutesUntilNext < 60
                  ? `${minutesUntilNext}min until ${nextFunction.name}`
                  : `${Math.floor(minutesUntilNext / 60)}h ${minutesUntilNext % 60}min until ${nextFunction.name}`}
              </Text>
              <Text style={s.alertSub}>{nextFunction.room} · {nextFunction.startTime} · {nextFunction.guestCount} guests</Text>
            </View>
          </View>
        )}

        <Text style={s.sectionLabel}>Prep Progress</Text>
        <View style={s.progressCard}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Today's Tasks</Text>
            <Text style={s.progressCount}>{completedPrep} / {totalPrep} complete</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${prepPercent * 100}%` }]} />
          </View>
        </View>

        <Text style={s.sectionLabel}>Functions Today</Text>
        {functions.map((fn) => {
          const fnStaff = staff.filter((st) => fn.teamIds.includes(st.id));
          return (
            <Pressable
              key={fn.id}
              style={({ pressed }) => [s.functionCard, pressed && { opacity: 0.8 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/function/${fn.id}`);
              }}
            >
              <View style={s.functionRow}>
                <Text style={s.functionTime}>{fn.startTime}</Text>
                <Text style={s.functionName} numberOfLines={1}>{fn.name}</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
              <View style={s.functionMeta}>
                <View style={s.metaChip}>
                  <MaterialCommunityIcons name="door" size={12} color={colors.mutedForeground} />
                  <Text style={s.metaText}>{fn.room}</Text>
                </View>
                <View style={s.metaChip}>
                  <Ionicons name="people" size={12} color={colors.mutedForeground} />
                  <Text style={s.metaText}>{fn.guestCount} pax</Text>
                </View>
              </View>
              <View style={s.teamRow}>
                {fnStaff.map((member) => (
                  <View
                    key={member.id}
                    style={[
                      s.avatar,
                      {
                        backgroundColor: getRoleColor(member.role, colors) + "25",
                        borderWidth: currentStaffId === member.id ? 1.5 : 0,
                        borderColor: getRoleColor(member.role, colors),
                      },
                    ]}
                  >
                    <Text style={[s.avatarText, { color: getRoleColor(member.role, colors) }]}>
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
