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

function getStatusColor(status: string, colors: ReturnType<typeof useColors>) {
  if (status === "active") return colors.primary;
  if (status === "completed") return colors.accent;
  return colors.warning;
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
  const { functions, prepItems, staff, todayDate } = useKitchen();

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const totalPrep = prepItems.length;
  const completedPrep = prepItems.filter((p) => p.completed).length;
  const prepPercent = totalPrep > 0 ? completedPrep / totalPrep : 0;

  const nextFunction = useMemo(() => {
    return functions
      .filter((f) => timeToMinutes(f.startTime) > nowMinutes)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0];
  }, [functions, nowMinutes]);

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
      paddingBottom: 16,
    },
    dateLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" },
    headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2 },
    alertBanner: {
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: colors.primary + "18",
      borderColor: colors.primary + "40",
      borderWidth: 1,
      borderRadius: colors.radius,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    alertText: { flex: 1 },
    alertTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary },
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
    functionMeta: { flexDirection: "row", gap: 12, alignItems: "center" },
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
    avatar: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
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

        {nextFunction && minutesUntilNext !== null && minutesUntilNext < 120 && (
          <View style={s.alertBanner}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View style={s.alertText}>
              <Text style={s.alertTitle}>
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
                  <View key={member.id} style={[s.avatar, { backgroundColor: getRoleColor(member.role, colors) + "25" }]}>
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
