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
  const { functions, staff, prepItems } = useKitchen();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function getRoleColor(role: string) {
    switch (role) {
      case "Head Chef": return colors.primary;
      case "Sous Chef": return colors.info;
      case "Pastry Chef": return "#A78BFA";
      case "Casual": return colors.warning;
      default: return colors.mutedForeground;
    }
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    card: {
      marginHorizontal: 20, marginBottom: 16,
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, overflow: "hidden",
    },
    cardTop: {
      backgroundColor: colors.primary + "15",
      borderBottomWidth: 1, borderBottomColor: colors.border,
      padding: 14, flexDirection: "row", alignItems: "center", gap: 10,
    },
    timePill: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    timePillText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
    cardName: { flex: 1, fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    keyInfoRow: {
      flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    keyInfoBox: {
      flex: 1, padding: 12, alignItems: "center", justifyContent: "center",
      borderRightWidth: 1, borderRightColor: colors.border,
    },
    keyInfoNum: { fontSize: 20, fontFamily: "Inter_700Bold" },
    keyInfoLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 },
    body: { padding: 14, gap: 14 },
    sectionHead: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
    menuRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 3 },
    menuDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
    menuText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, flex: 1, lineHeight: 20 },
    teamWrap: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    teamBadge: {
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
    },
    teamDot: { width: 8, height: 8, borderRadius: 4 },
    teamName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    teamRole: { fontSize: 10, fontFamily: "Inter_400Regular" },
    viewBtn: {
      marginHorizontal: 14, marginBottom: 14,
      backgroundColor: colors.primary,
      borderRadius: colors.radius - 2,
      paddingVertical: 12,
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    viewBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
    progressBarWrap: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden", marginTop: 4 },
    progressBarFill: { height: 5, borderRadius: 3 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Events</Text>
          <Text style={s.subtitle}>{functions.length} events on today — tap any event for full details</Text>
        </View>

        {functions.map((fn) => {
          const fnStaff = staff.filter((st) => fn.teamIds.includes(st.id));
          const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
          const prepDone = fnPrep.filter((p) => p.completed).length;
          const stepsDone = fn.timeline.filter((t) => t.completed).length;
          const prepPct = fnPrep.length > 0 ? prepDone / fnPrep.length : 0;

          return (
            <View key={fn.id} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.timePill}>
                  <Text style={s.timePillText}>{fn.startTime}</Text>
                </View>
                <Text style={s.cardName} numberOfLines={1}>{fn.name}</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>

              <View style={s.keyInfoRow}>
                <View style={s.keyInfoBox}>
                  <Text style={[s.keyInfoNum, { color: colors.foreground }]}>{fn.guestCount}</Text>
                  <Text style={s.keyInfoLabel}>Guests</Text>
                </View>
                <View style={s.keyInfoBox}>
                  <Text style={[s.keyInfoNum, { color: colors.info }]}>{fn.startTime}–{fn.endTime}</Text>
                  <Text style={s.keyInfoLabel}>Service time</Text>
                </View>
                <View style={[s.keyInfoBox, { borderRightWidth: 0 }]}>
                  <Text style={[s.keyInfoNum, { color: prepPct === 1 ? colors.accent : colors.warning }]}>
                    {prepDone}/{fnPrep.length}
                  </Text>
                  <Text style={s.keyInfoLabel}>Food ready</Text>
                  <View style={s.progressBarWrap}>
                    <View style={[s.progressBarFill, { width: `${prepPct * 100}%`, backgroundColor: prepPct === 1 ? colors.accent : colors.warning }]} />
                  </View>
                </View>
              </View>

              <View style={s.body}>
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <MaterialCommunityIcons name="door" size={13} color={colors.mutedForeground} />
                    <Text style={[s.sectionHead, { marginBottom: 0 }]}>Room</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{fn.room}</Text>
                </View>

                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Feather name="coffee" size={13} color={colors.mutedForeground} />
                    <Text style={[s.sectionHead, { marginBottom: 0 }]}>What's being served</Text>
                  </View>
                  {fn.menu.slice(0, 3).map((item, i) => (
                    <View key={i} style={s.menuRow}>
                      <View style={[s.menuDot, { backgroundColor: colors.primary }]} />
                      <Text style={s.menuText}>{item}</Text>
                    </View>
                  ))}
                  {fn.menu.length > 3 && (
                    <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.primary, marginTop: 2 }}>
                      + {fn.menu.length - 3} more courses — see full details
                    </Text>
                  )}
                </View>

                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Ionicons name="people" size={13} color={colors.mutedForeground} />
                    <Text style={[s.sectionHead, { marginBottom: 0 }]}>Who's working this event</Text>
                  </View>
                  <View style={s.teamWrap}>
                    {fnStaff.map((member) => {
                      const rc = getRoleColor(member.role);
                      return (
                        <View key={member.id} style={[s.teamBadge, { backgroundColor: rc + "18", borderColor: rc + "40" }]}>
                          <View style={[s.teamDot, { backgroundColor: rc }]} />
                          <View>
                            <Text style={[s.teamName, { color: rc }]}>{member.name}</Text>
                            <Text style={[s.teamRole, { color: colors.mutedForeground }]}>{member.role}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name="check-circle" size={13} color={colors.mutedForeground} />
                  <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                    Work plan: {stepsDone} of {fn.timeline.length} tasks done
                  </Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [s.viewBtn, pressed && { opacity: 0.8 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/function/${fn.id}`);
                }}
              >
                <Text style={s.viewBtnText}>Open full details</Text>
                <Feather name="arrow-right" size={15} color="#fff" />
              </Pressable>
            </View>
          );
        })}
        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
