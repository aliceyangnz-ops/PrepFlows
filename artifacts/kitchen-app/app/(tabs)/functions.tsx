import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
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

export default function FunctionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { functions, staff } = useKitchen();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    card: {
      marginHorizontal: 20,
      marginBottom: 14,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    cardHeader: {
      backgroundColor: colors.primary + "18",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
    },
    timeBox: {
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 10,
    },
    timeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    cardTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    cardBody: { padding: 14, gap: 10 },
    metaRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.secondary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    chipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground },
    menuSection: { gap: 4 },
    menuLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" },
    menuItem: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    teamSection: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    teamBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    teamName: { fontSize: 12, fontFamily: "Inter_500Medium" },
    teamRole: { fontSize: 10, fontFamily: "Inter_400Regular" },
    viewBtn: {
      margin: 14,
      marginTop: 0,
      backgroundColor: colors.secondary,
      borderRadius: colors.radius - 2,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    viewBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  function getRoleColor(role: string) {
    switch (role) {
      case "Head Chef": return colors.primary;
      case "Sous Chef": return colors.info;
      case "Pastry Chef": return "#A78BFA";
      case "Casual": return colors.warning;
      default: return colors.mutedForeground;
    }
  }

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Functions</Text>
          <Text style={s.subtitle}>{functions.length} events today</Text>
        </View>

        {functions.map((fn) => {
          const fnStaff = staff.filter((st) => fn.teamIds.includes(st.id));
          const completedTimeline = fn.timeline.filter((t) => t.completed).length;
          return (
            <View key={fn.id} style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.timeBox}>
                  <Text style={s.timeText}>{fn.startTime}</Text>
                </View>
                <Text style={s.cardTitle} numberOfLines={1}>{fn.name}</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>

              <View style={s.cardBody}>
                <View style={s.metaRow}>
                  <View style={s.chip}>
                    <MaterialCommunityIcons name="door" size={13} color={colors.mutedForeground} />
                    <Text style={s.chipText}>{fn.room}</Text>
                  </View>
                  <View style={s.chip}>
                    <Ionicons name="people" size={13} color={colors.mutedForeground} />
                    <Text style={s.chipText}>{fn.guestCount} guests</Text>
                  </View>
                  <View style={s.chip}>
                    <Feather name="clock" size={13} color={colors.mutedForeground} />
                    <Text style={s.chipText}>{fn.startTime} – {fn.endTime}</Text>
                  </View>
                  <View style={[s.chip, { backgroundColor: colors.accent + "20" }]}>
                    <Feather name="check-square" size={13} color={colors.accent} />
                    <Text style={[s.chipText, { color: colors.accent }]}>{completedTimeline}/{fn.timeline.length} steps</Text>
                  </View>
                </View>

                <View style={s.menuSection}>
                  <Text style={s.menuLabel}>Menu</Text>
                  {fn.menu.slice(0, 3).map((item, i) => (
                    <Text key={i} style={s.menuItem}>· {item}</Text>
                  ))}
                  {fn.menu.length > 3 && (
                    <Text style={[s.menuItem, { color: colors.primary }]}>+{fn.menu.length - 3} more courses</Text>
                  )}
                </View>

                <View style={s.menuSection}>
                  <Text style={s.menuLabel}>Team</Text>
                  <View style={s.teamSection}>
                    {fnStaff.map((member) => {
                      const rc = getRoleColor(member.role);
                      return (
                        <View key={member.id} style={[s.teamBadge, { backgroundColor: rc + "18", borderColor: rc + "40" }]}>
                          <View style={{ gap: 0 }}>
                            <Text style={[s.teamName, { color: rc }]}>{member.name}</Text>
                            <Text style={[s.teamRole, { color: colors.mutedForeground }]}>{member.role}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [s.viewBtn, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/function/${fn.id}`);
                }}
              >
                <Text style={s.viewBtnText}>View Full Details</Text>
                <Feather name="arrow-right" size={14} color={colors.primary} />
              </Pressable>
            </View>
          );
        })}
        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
