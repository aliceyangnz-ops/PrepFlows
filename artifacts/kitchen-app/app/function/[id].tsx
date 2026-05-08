import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function FunctionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, staff, prepItems, toggleTimelineItem } = useKitchen();

  const fn = functions.find((f) => f.id === id);

  if (!fn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Function not found</Text>
      </View>
    );
  }

  const fnStaff = staff.filter((s) => fn.teamIds.includes(s.id));
  const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
  const prepDone = fnPrep.filter((p) => p.completed).length;
  const timelineDone = fn.timeline.filter((t) => t.completed).length;

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
    backBtn: {
      position: "absolute",
      top: topPad + 8,
      left: 16,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    heroBar: {
      paddingTop: topPad + 56,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    fnName: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
    progressRow: { flexDirection: "row", gap: 10, marginTop: 14 },
    miniStat: {
      flex: 1,
      backgroundColor: colors.secondary,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
    },
    miniNum: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    miniLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8 },
    section: { padding: 20 },
    sectionTitle: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 },
    timelineItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 4,
      gap: 12,
    },
    timelineLeft: { alignItems: "center", width: 44 },
    timelineTime: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary, marginBottom: 4 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
    timelineLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: colors.border, marginTop: 2 },
    timelineText: {
      flex: 1,
      paddingTop: 0,
    },
    timelineTask: { fontSize: 14, fontFamily: "Inter_500Medium", paddingTop: 0 },
    checkBtn: {
      width: 28,
      height: 28,
      borderRadius: 7,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 0,
    },
    menuItem: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    menuText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, flex: 1 },
    teamCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    roleAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    memberName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    memberRole: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    memberShift: { marginLeft: "auto" as const, fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    div: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 40 },
  });

  return (
    <View style={s.root}>
      <Pressable
        style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={18} color={colors.foreground} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.heroBar}>
          <Text style={s.fnName}>{fn.name}</Text>
          <View style={s.metaRow}>
            <View style={s.chip}>
              <MaterialCommunityIcons name="door" size={13} color={colors.mutedForeground} />
              <Text style={s.chipText}>{fn.room}</Text>
            </View>
            <View style={s.chip}>
              <Feather name="clock" size={13} color={colors.mutedForeground} />
              <Text style={s.chipText}>{fn.startTime} – {fn.endTime}</Text>
            </View>
            <View style={[s.chip, { backgroundColor: colors.primary + "20" }]}>
              <Ionicons name="people" size={13} color={colors.primary} />
              <Text style={[s.chipText, { color: colors.primary }]}>{fn.guestCount} guests</Text>
            </View>
          </View>
          <View style={s.progressRow}>
            <View style={s.miniStat}>
              <Text style={[s.miniNum, { color: colors.accent }]}>{prepDone}/{fnPrep.length}</Text>
              <Text style={s.miniLabel}>Prep Done</Text>
            </View>
            <View style={s.miniStat}>
              <Text style={[s.miniNum, { color: colors.primary }]}>{timelineDone}/{fn.timeline.length}</Text>
              <Text style={s.miniLabel}>Steps Done</Text>
            </View>
            <View style={s.miniStat}>
              <Text style={[s.miniNum, { color: colors.warning }]}>{fnStaff.length}</Text>
              <Text style={s.miniLabel}>On Team</Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Preparation Timeline</Text>
          {fn.timeline.map((item, idx) => {
            const isLast = idx === fn.timeline.length - 1;
            return (
              <View key={item.id} style={s.timelineItem}>
                <View style={s.timelineLeft}>
                  <Text style={s.timelineTime}>{item.time}</Text>
                  <View
                    style={[
                      s.timelineDot,
                      {
                        backgroundColor: item.completed ? colors.accent : colors.background,
                        borderColor: item.completed ? colors.accent : colors.border,
                      },
                    ]}
                  />
                  {!isLast && <View style={s.timelineLine} />}
                </View>
                <View style={s.timelineText}>
                  <Text
                    style={[
                      s.timelineTask,
                      {
                        color: item.completed ? colors.mutedForeground : colors.foreground,
                        textDecorationLine: item.completed ? "line-through" : "none",
                        paddingTop: 0,
                      },
                    ]}
                  >
                    {item.task}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    s.checkBtn,
                    {
                      backgroundColor: item.completed ? colors.accent : "transparent",
                      borderColor: item.completed ? colors.accent : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleTimelineItem(fn.id, item.id);
                  }}
                >
                  {item.completed && <Feather name="check" size={14} color="#fff" />}
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={s.div} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Menu</Text>
          {fn.menu.map((item, i) => (
            <View key={i} style={s.menuItem}>
              <Feather name="circle" size={6} color={colors.primary} style={{ marginTop: 2 }} />
              <Text style={s.menuText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={s.div} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Team</Text>
          {fnStaff.map((member) => {
            const rc = getRoleColor(member.role);
            return (
              <View key={member.id} style={s.teamCard}>
                <View style={[s.roleAvatar, { backgroundColor: rc + "25" }]}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: rc }}>
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </Text>
                </View>
                <View>
                  <Text style={s.memberName}>{member.name}</Text>
                  <Text style={[s.memberRole, { color: rc }]}>{member.role}</Text>
                </View>
                <Text style={s.memberShift}>{member.shiftStart}–{member.shiftEnd}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
