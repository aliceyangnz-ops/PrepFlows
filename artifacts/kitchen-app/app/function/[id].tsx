import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FunctionType, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

function getFunctionTypeColor(type: FunctionType): string {
  switch (type) {
    case "A-la-carte": return "#F59E0B";
    case "Buffet": return "#3B82F6";
    case "Cocktail": return "#8B5CF6";
    case "Canapés": return "#22C55E";
    case "Canapés + A-la-carte": return "#F97316";
    case "School Ball": return "#EC4899";
    case "Set Menu": return "#14B8A6";
    case "High Tea": return "#F43F5E";
    default: return "#6B7A94";
  }
}

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
  const tc = getFunctionTypeColor(fn.functionType);
  const isAlaCarte = fn.functionType === "A-la-carte" || fn.functionType === "Canapés + A-la-carte";
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
    backBtn: { position: "absolute", top: topPad + 8, left: 16, zIndex: 10, width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    hero: { paddingTop: topPad + 62, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    typePill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5, marginBottom: 10 },
    typeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    eventName: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 12, lineHeight: 28 },
    roomRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    roomLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    roomValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    infoGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
    infoBox: { flex: 1, backgroundColor: colors.secondary, borderRadius: 10, padding: 12, alignItems: "center" },
    infoNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
    infoLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 3 },
    statsRow: { flexDirection: "row", gap: 8 },
    statBox: { flex: 1, backgroundColor: colors.secondary, borderRadius: 10, padding: 12, alignItems: "center" },
    statNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
    statLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.7, marginTop: 3 },
    courseCard: { marginHorizontal: 20, marginTop: 18, backgroundColor: tc + "12", borderRadius: colors.radius, borderWidth: 1.5, borderColor: tc + "40", overflow: "hidden" },
    courseCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc + "30" },
    courseCardTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: tc },
    courseRow: { flexDirection: "row" },
    courseBox: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: tc + "25" },
    courseLabel: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
    courseTime: { fontSize: 20, fontFamily: "Inter_700Bold" },
    section: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 4 },
    sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 14 },
    div: { height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginTop: 16 },
    taskRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 13, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    taskTime: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary, width: 52, paddingTop: 2 },
    taskText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 22 },
    checkBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    menuItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border },
    menuCourse: { fontSize: 10, fontFamily: "Inter_700Bold", color: tc, textTransform: "uppercase", letterSpacing: 0.6, width: 58, paddingTop: 3 },
    menuDish: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 21 },
    memberRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    memberAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
    memberAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
    memberName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    memberRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    memberShiftLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    memberShiftTime: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 1 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 40 },
  });

  const courseOrder: Array<{ key: keyof typeof fn.serviceTimes; label: string }> = [
    { key: "amuse", label: "Amuse" },
    { key: "entree", label: "Entrée" },
    { key: "main", label: "Main" },
    { key: "dessert", label: "Dessert" },
    { key: "supper", label: "Supper" },
  ];
  const activeCourses = fn.serviceTimes
    ? courseOrder.filter((c) => fn.serviceTimes![c.key])
    : [];

  function parseMenuCourse(item: string): { course: string; dish: string } {
    const colonIdx = item.indexOf(":");
    if (colonIdx > -1) return { course: item.slice(0, colonIdx).trim(), dish: item.slice(colonIdx + 1).trim() };
    return { course: "", dish: item };
  }

  return (
    <View style={s.root}>
      <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
        <Feather name="arrow-left" size={18} color={colors.foreground} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={[s.typePill, { backgroundColor: tc + "20", borderColor: tc + "60" }]}>
            <Text style={[s.typeText, { color: tc }]}>{fn.functionType}</Text>
          </View>

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
              <Text style={s.infoLabel}>Start</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={[s.infoNum, { color: colors.mutedForeground }]}>{fn.endTime}</Text>
              <Text style={s.infoLabel}>Finish</Text>
            </View>
          </View>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: prepDone === fnPrep.length && fnPrep.length > 0 ? colors.accent : colors.warning }]}>{prepDone}/{fnPrep.length}</Text>
              <Text style={s.statLabel}>Food ready</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: stepsDone === fn.timeline.length && fn.timeline.length > 0 ? colors.accent : colors.primary }]}>{stepsDone}/{fn.timeline.length}</Text>
              <Text style={s.statLabel}>Tasks done</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: colors.foreground }]}>{fnStaff.length}</Text>
              <Text style={s.statLabel}>Staff</Text>
            </View>
          </View>
        </View>

        {isAlaCarte && activeCourses.length > 0 && (
          <View style={s.courseCard}>
            <View style={s.courseCardHeader}>
              <Feather name="clock" size={14} color={tc} />
              <Text style={s.courseCardTitle}>Course Fire Times — A-la-carte</Text>
            </View>
            <View style={s.courseRow}>
              {activeCourses.map((c, idx) => (
                <View key={c.key} style={[s.courseBox, idx === activeCourses.length - 1 && { borderRightWidth: 0 }]}>
                  <Text style={[s.courseLabel, { color: tc + "AA" }]}>{c.label}</Text>
                  <Text style={[s.courseTime, { color: tc }]}>{fn.serviceTimes![c.key]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Work Plan</Text>
          <Text style={s.sectionSub}>Tap the box to mark each task done</Text>
          {fn.timeline.map((item) => (
            <View key={item.id} style={s.taskRow}>
              <Text style={s.taskTime}>{item.time}</Text>
              <Text style={[s.taskText, { color: item.completed ? colors.mutedForeground : colors.foreground, textDecorationLine: item.completed ? "line-through" : "none" }]}>
                {item.task}
              </Text>
              <Pressable
                style={({ pressed }) => [s.checkBtn, { backgroundColor: item.completed ? colors.accent : "transparent", borderColor: item.completed ? colors.accent : colors.border, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTimelineItem(fn.id, item.id); }}
              >
                {item.completed && <Feather name="check" size={18} color="#fff" />}
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
                {course ? <Text style={s.menuCourse}>{course}</Text> : <Feather name="circle" size={6} color={colors.primary} style={{ marginTop: 6, marginRight: 4 }} />}
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
                  <Text style={[s.memberAvatarText, { color: rc }]}>{member.name.split(" ").map((n) => n[0]).join("")}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{member.name}</Text>
                  <Text style={[s.memberRole, { color: rc }]}>{member.role}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
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
