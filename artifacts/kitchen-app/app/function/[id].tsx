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
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Event not found</Text>
      </View>
    );
  }

  const fnStaff = staff.filter((s) => fn.teamIds.includes(s.id));
  const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
  const prepDone = fnPrep.filter((p) => p.completed).length;
  const stepsDone = fn.timeline.filter((t) => t.completed).length;
  const stepsTotal = fn.timeline.length;

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
      position: "absolute", top: topPad + 8, left: 16, zIndex: 10,
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      alignItems: "center", justifyContent: "center",
    },
    hero: {
      paddingTop: topPad + 62, paddingHorizontal: 20, paddingBottom: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    eventName: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 12, lineHeight: 28 },
    roomRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    roomLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    roomValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    infoGrid: { flexDirection: "row", gap: 10, marginTop: 6 },
    infoBox: {
      flex: 1, backgroundColor: colors.secondary,
      borderRadius: 10, padding: 12, alignItems: "center",
    },
    infoNum: { fontSize: 20, fontFamily: "Inter_700Bold" },
    infoLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 3 },
    statsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
    statBox: {
      flex: 1, backgroundColor: colors.secondary,
      borderRadius: 10, padding: 12, alignItems: "center",
    },
    statNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
    statLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.7, marginTop: 3 },
    section: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 4 },
    sectionTitle: {
      fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground,
      marginBottom: 4,
    },
    sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 14 },
    div: { height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginTop: 16 },
    taskRow: {
      flexDirection: "row", alignItems: "center",
      paddingVertical: 12, gap: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    taskLeft: { width: 52, alignItems: "center" },
    taskTime: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary },
    taskBody: { flex: 1 },
    taskText: { fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 21 },
    checkBtn: {
      width: 34, height: 34, borderRadius: 8, borderWidth: 2,
      alignItems: "center", justifyContent: "center",
    },
    menuItem: {
      flexDirection: "row", alignItems: "flex-start", gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    menuCourse: { fontSize: 11, fontFamily: "Inter_700Bold", color: colors.primary, textTransform: "uppercase", letterSpacing: 0.6, width: 60, paddingTop: 2 },
    menuDish: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 20 },
    memberRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    memberAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
    memberAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    memberRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    memberShift: { alignItems: "flex-end" },
    memberShiftLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    memberShiftTime: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 1 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 40 },
  });

  function parseMenuCourse(item: string): { course: string; dish: string } {
    const colonIdx = item.indexOf(":");
    if (colonIdx > -1) {
      return { course: item.slice(0, colonIdx).trim(), dish: item.slice(colonIdx + 1).trim() };
    }
    return { course: "", dish: item };
  }

  return (
    <View style={s.root}>
      <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
        <Feather name="arrow-left" size={18} color={colors.foreground} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Text style={s.eventName}>{fn.name}</Text>

          <View style={s.roomRow}>
            <MaterialCommunityIcons name="door" size={16} color={colors.mutedForeground} />
            <Text style={s.roomLabel}>Room</Text>
            <Text style={s.roomValue}>{fn.room}</Text>
          </View>

          <View style={s.infoGrid}>
            <View style={s.infoBox}>
              <Text style={[s.infoNum, { color: colors.foreground }]}>{fn.guestCount}</Text>
              <Text style={s.infoLabel}>Guests</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={[s.infoNum, { color: colors.info }]}>{fn.startTime}</Text>
              <Text style={s.infoLabel}>Start time</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={[s.infoNum, { color: colors.mutedForeground }]}>{fn.endTime}</Text>
              <Text style={s.infoLabel}>End time</Text>
            </View>
          </View>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: prepDone === fnPrep.length && fnPrep.length > 0 ? colors.accent : colors.warning }]}>
                {prepDone}/{fnPrep.length}
              </Text>
              <Text style={s.statLabel}>Food ready</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: stepsDone === stepsTotal && stepsTotal > 0 ? colors.accent : colors.primary }]}>
                {stepsDone}/{stepsTotal}
              </Text>
              <Text style={s.statLabel}>Tasks done</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: colors.foreground }]}>{fnStaff.length}</Text>
              <Text style={s.statLabel}>Staff working</Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Work Plan</Text>
          <Text style={s.sectionSub}>What needs to be done and when — tap the box to mark as done</Text>
          {fn.timeline.map((item) => (
            <View key={item.id} style={s.taskRow}>
              <View style={s.taskLeft}>
                <Text style={s.taskTime}>{item.time}</Text>
              </View>
              <View style={s.taskBody}>
                <Text
                  style={[
                    s.taskText,
                    {
                      color: item.completed ? colors.mutedForeground : colors.foreground,
                      textDecorationLine: item.completed ? "line-through" : "none",
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
                {item.completed && <Feather name="check" size={16} color="#fff" />}
              </Pressable>
            </View>
          ))}
        </View>

        <View style={s.div} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>What's Being Served</Text>
          <Text style={s.sectionSub}>{fn.menu.length} courses</Text>
          {fn.menu.map((item, i) => {
            const { course, dish } = parseMenuCourse(item);
            return (
              <View key={i} style={s.menuItem}>
                {course ? (
                  <Text style={s.menuCourse}>{course}</Text>
                ) : (
                  <Feather name="circle" size={6} color={colors.primary} style={{ marginTop: 6, marginRight: 4 }} />
                )}
                <Text style={s.menuDish}>{dish}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.div} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Staff Working This Event</Text>
          <Text style={s.sectionSub}>{fnStaff.length} people on this team</Text>
          {fnStaff.map((member) => {
            const rc = getRoleColor(member.role);
            return (
              <View key={member.id} style={s.memberRow}>
                <View style={[s.memberAvatar, { backgroundColor: rc + "25" }]}>
                  <Text style={[s.memberAvatarText, { color: rc }]}>
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </Text>
                </View>
                <View style={s.memberInfo}>
                  <Text style={s.memberName}>{member.name}</Text>
                  <Text style={[s.memberRole, { color: rc }]}>{member.role}</Text>
                </View>
                <View style={s.memberShift}>
                  <Text style={s.memberShiftLabel}>Shift</Text>
                  <Text style={s.memberShiftTime}>{member.shiftStart}–{member.shiftEnd}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
