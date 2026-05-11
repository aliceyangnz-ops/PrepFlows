import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FunctionType, getAccessLevel, useKitchen } from "@/context/KitchenContext";
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

export default function FunctionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { functions, staff, prepItems, currentStaffId } = useKitchen();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const isManager = currentMember ? getAccessLevel(currentMember) === "manager" : false;
  const myFunctions = currentMember ? functions.filter((f) => currentMember.functionIds.includes(f.id)) : [];


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
    header: { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center" },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    card: { marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    cardTop: { borderBottomWidth: 1, borderBottomColor: colors.border, padding: 14 },
    cardTopRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    timePill: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    timePillText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
    cardName: { flex: 1, fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    typeRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    typePill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
    typeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    courseTime: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.secondary },
    courseTimeLabel: { fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5 },
    courseTimeValue: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    keyInfoRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border },
    keyInfoBox: { flex: 1, padding: 12, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: colors.border },
    keyInfoNum: { fontSize: 20, fontFamily: "Inter_700Bold" },
    keyInfoLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 },
    body: { padding: 14, gap: 14 },
    sectionHead: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
    roomValue: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    menuRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 3 },
    menuDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
    menuText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, flex: 1, lineHeight: 20 },
    teamWrap: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    teamBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    teamDot: { width: 8, height: 8, borderRadius: 4 },
    teamName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    teamRole: { fontSize: 10, fontFamily: "Inter_400Regular" },
    progressBarWrap: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden", marginTop: 4 },
    progressBarFill: { height: 5, borderRadius: 3 },
    viewBtn: { marginHorizontal: 14, marginBottom: 14, backgroundColor: colors.primary, borderRadius: colors.radius - 2, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    viewBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Events</Text>
            <Text style={s.subtitle}>{functions.length} events today — tap any event for full details</Text>
          </View>
          {isManager && (
            <Pressable
              style={({ pressed }) => [{
                flexDirection: "row", alignItems: "center", gap: 6,
                paddingHorizontal: 14, paddingVertical: 9,
                borderRadius: 10, backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1, marginBottom: 4,
              }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/function/add"); }}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" }}>Add Event</Text>
            </Pressable>
          )}
        </View>

        {isManager ? (
          /* ── MANAGER: full detail cards ──────────────────────── */
          functions.map((fn) => {
            const fnStaff = staff.filter((st) => fn.teamIds.includes(st.id));
            const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
            const prepDone = fnPrep.filter((p) => p.completed).length;
            const stepsDone = fn.timeline.filter((t) => t.completed).length;
            const prepPct = fnPrep.length > 0 ? prepDone / fnPrep.length : 0;
            const tc = getFunctionTypeColor(fn.functionType);
            const isAlaCarte = fn.functionType === "A-la-carte" || fn.functionType === "Canapés + A-la-carte";
            return (
              <View key={fn.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.cardTopRow}>
                    <View style={s.timePill}><Text style={s.timePillText}>{fn.startTime}</Text></View>
                    <Text style={s.cardName} numberOfLines={1}>{fn.name}</Text>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </View>
                  <View style={s.typeRow}>
                    <View style={[s.typePill, { backgroundColor: tc + "20", borderColor: tc + "50" }]}><Text style={[s.typeText, { color: tc }]}>{fn.functionType}</Text></View>
                    {isAlaCarte && fn.serviceTimes && (<>
                      {fn.serviceTimes.amuse && <View style={s.courseTime}><Text style={s.courseTimeLabel}>Amuse</Text><Text style={s.courseTimeValue}>{fn.serviceTimes.amuse}</Text></View>}
                      {fn.serviceTimes.entree && <View style={s.courseTime}><Text style={s.courseTimeLabel}>Ent.</Text><Text style={s.courseTimeValue}>{fn.serviceTimes.entree}</Text></View>}
                      {fn.serviceTimes.main && <View style={s.courseTime}><Text style={s.courseTimeLabel}>Main</Text><Text style={s.courseTimeValue}>{fn.serviceTimes.main}</Text></View>}
                      {fn.serviceTimes.dessert && <View style={s.courseTime}><Text style={s.courseTimeLabel}>Des.</Text><Text style={s.courseTimeValue}>{fn.serviceTimes.dessert}</Text></View>}
                    </>)}
                  </View>
                </View>
                <View style={s.keyInfoRow}>
                  <View style={s.keyInfoBox}><Text style={[s.keyInfoNum, { color: colors.foreground }]}>{fn.guestCount}</Text><Text style={s.keyInfoLabel}>Guests</Text></View>
                  <View style={s.keyInfoBox}><Text style={[s.keyInfoNum, { color: colors.info }]}>{fn.startTime}–{fn.endTime}</Text><Text style={s.keyInfoLabel}>Service time</Text></View>
                  <View style={[s.keyInfoBox, { borderRightWidth: 0 }]}>
                    <Text style={[s.keyInfoNum, { color: prepPct === 1 ? colors.accent : colors.warning }]}>{prepDone}/{fnPrep.length}</Text>
                    <Text style={s.keyInfoLabel}>Food ready</Text>
                    <View style={s.progressBarWrap}><View style={[s.progressBarFill, { width: `${prepPct * 100}%`, backgroundColor: prepPct === 1 ? colors.accent : colors.warning }]} /></View>
                  </View>
                </View>
                <View style={s.body}>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}><MaterialCommunityIcons name="door" size={13} color={colors.mutedForeground} /><Text style={[s.sectionHead, { marginBottom: 0 }]}>Room</Text></View>
                    <Text style={s.roomValue}>{fn.room}</Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}><Feather name="coffee" size={13} color={colors.mutedForeground} /><Text style={[s.sectionHead, { marginBottom: 0 }]}>What's being served</Text></View>
                    {fn.menu.slice(0, 3).map((item, i) => <View key={i} style={s.menuRow}><View style={[s.menuDot, { backgroundColor: colors.primary }]} /><Text style={s.menuText}>{item}</Text></View>)}
                    {fn.menu.length > 3 && <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.primary, marginTop: 2 }}>+ {fn.menu.length - 3} more — see full details</Text>}
                  </View>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}><Ionicons name="people" size={13} color={colors.mutedForeground} /><Text style={[s.sectionHead, { marginBottom: 0 }]}>Who's working this event</Text></View>
                    <View style={s.teamWrap}>
                      {fnStaff.map((member) => { const rc = getRoleColor(member.role); return (<View key={member.id} style={[s.teamBadge, { backgroundColor: rc + "18", borderColor: rc + "40" }]}><View style={[s.teamDot, { backgroundColor: rc }]} /><View><Text style={[s.teamName, { color: rc }]}>{member.name}</Text><Text style={[s.teamRole, { color: colors.mutedForeground }]}>{member.role}</Text></View></View>); })}
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Feather name="check-circle" size={13} color={colors.mutedForeground} /><Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Work plan: {stepsDone} of {fn.timeline.length} tasks done</Text></View>
                </View>
                <Pressable style={({ pressed }) => [s.viewBtn, pressed && { opacity: 0.8 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}>
                  <Text style={s.viewBtnText}>Open full details</Text>
                  <Feather name="arrow-right" size={15} color="#fff" />
                </Pressable>
              </View>
            );
          })
        ) : (
          /* ── STAFF / TEAM LEADER: compact "where to go" cards ── */
          (myFunctions.length > 0 ? myFunctions : functions).map((fn) => {
            const tc = getFunctionTypeColor(fn.functionType);
            const mySection = currentMember?.section;
            const fnTeamStaff = staff.filter((st) => fn.teamIds.includes(st.id) && st.section === mySection);
            const myLeader = fnTeamStaff.find((st) => !!st.teamLeadFor) ?? null;
            const dietaryReqs = fn.dietaryRequirements ?? [];
            const hasDietary = dietaryReqs.length > 0;
            return (
              <Pressable key={fn.id} style={({ pressed }) => [s.card, { overflow: "hidden", opacity: pressed ? 0.9 : 1 }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}>
                {/* Time + name header */}
                <View style={[s.cardTop, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <View style={s.cardTopRow}>
                    <View style={s.timePill}><Text style={s.timePillText}>{fn.startTime}</Text></View>
                    <Text style={s.cardName} numberOfLines={1}>{fn.name}</Text>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </View>
                </View>
                {/* WHERE TO GO hero */}
                <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.primary, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Where to go</Text>
                  <Text style={{ fontSize: 30, fontFamily: "Inter_700Bold", color: colors.foreground, lineHeight: 36 }}>{fn.room}</Text>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 4 }}>{fn.floor} · {fn.startTime}–{fn.endTime} · {fn.guestCount} guests</Text>
                </View>
                {/* My team + leader */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tc + "25", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: tc }}>{(mySection ?? fn.name).charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>{mySection ?? "No team assigned"}</Text>
                    {myLeader ? (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
                        Leader: {myLeader.name}{myLeader.phone ? ` · ${myLeader.phone}` : ""}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>Speak to your manager for team assignment</Text>
                    )}
                  </View>
                  {hasDietary && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#F59E0B15", borderRadius: 8, borderWidth: 1, borderColor: "#F59E0B40" }}>
                      <Ionicons name="warning" size={12} color="#F59E0B" />
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#F59E0B" }}>{dietaryReqs.length} dietary</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
