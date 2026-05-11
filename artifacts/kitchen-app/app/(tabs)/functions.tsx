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
    case "A-la-carte":          return "#F59E0B";
    case "Buffet":              return "#3B82F6";
    case "Cocktail":            return "#8B5CF6";
    case "Canapés":             return "#22C55E";
    case "Canapés + A-la-carte": return "#F97316";
    case "School Ball":         return "#EC4899";
    case "Set Menu":            return "#14B8A6";
    case "High Tea":            return "#F43F5E";
    default:                    return "#6B7A94";
  }
}

function getDietaryColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gluten") || n.includes("gf")) return "#22C55E";
  if (n.includes("vegan"))                       return "#84CC16";
  if (n.includes("vegetarian"))                  return "#4ADE80";
  if (n.includes("dairy") || n.includes("df"))   return "#60A5FA";
  if (n.includes("halal"))                       return "#14B8A6";
  if (n.includes("nut"))                         return "#F59E0B";
  if (n.includes("shellfish"))                   return "#F97316";
  if (n.includes("kosher"))                      return "#A78BFA";
  if (n.includes("egg"))                         return "#FCD34D";
  return "#94A3B8";
}

function getDietaryTag(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gluten"))     return "GF";
  if (n.includes("vegan"))      return "VGN";
  if (n.includes("vegetarian")) return "VGT";
  if (n.includes("dairy"))      return "DF";
  if (n.includes("halal"))      return "Halal";
  if (n.includes("nut"))        return "Nut Free";
  if (n.includes("shellfish"))  return "SF Free";
  if (n.includes("kosher"))     return "Kosher";
  if (n.includes("egg"))        return "Egg Free";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 4);
}


export default function FunctionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { functions, staff, prepItems, currentStaffId, hiddenFunctionIds, hideFunction, showFunction } = useKitchen();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const accessLevel = currentMember ? getAccessLevel(currentMember) : null;
  const isManager = accessLevel === "manager";
  const isTeamLeader = accessLevel === "team_leader";

  // Managers see all; team leaders see all (but can hide); staff/casual see only their functions
  const visibleFunctions = React.useMemo(() => {
    if (!currentMember || isManager) return functions;
    if (isTeamLeader) return functions.filter((f) => !hiddenFunctionIds.includes(f.id));
    // Staff/casual: assigned functions only
    return functions.filter((f) =>
      currentMember.functionIds.includes(f.id) || f.teamIds.includes(currentMember.id)
    );
  }, [functions, currentMember, isManager, isTeamLeader, hiddenFunctionIds]);

  // Functions the team leader CAN hide (not directly assigned to them)
  const hidableIds = React.useMemo(() => {
    if (!currentMember || !isTeamLeader) return new Set<string>();
    return new Set(
      functions
        .filter((f) => !currentMember.functionIds.includes(f.id) && !f.teamIds.includes(currentMember.id))
        .map((f) => f.id)
    );
  }, [functions, currentMember, isTeamLeader]);

  // Hidden functions that a team leader can reveal again
  const hiddenForLeader = React.useMemo(() => {
    if (!isTeamLeader) return [];
    return functions.filter((f) => hiddenFunctionIds.includes(f.id));
  }, [functions, isTeamLeader, hiddenFunctionIds]);

  const s = StyleSheet.create({
    root:       { flex: 1, backgroundColor: colors.background },
    header:     { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center" },
    title:      { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle:   { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    card:       { marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    viewBtn:    { marginHorizontal: 12, marginBottom: 12, backgroundColor: colors.primary, borderRadius: colors.radius - 2, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    viewBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
    bottomPad:  { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
    /* non-manager compact */
    timePill:     { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    timePillText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
    cardName:     { flex: 1, fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    cardTop:      { borderBottomWidth: 1, borderBottomColor: colors.border, padding: 14 },
    cardTopRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 0 },
  });

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Events</Text>
            <Text style={s.subtitle}>{visibleFunctions.length} function{visibleFunctions.length !== 1 ? "s" : ""} showing</Text>
          </View>
          {isManager && (
            <Pressable
              style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1, marginBottom: 4 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/function/add"); }}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" }}>Add Event</Text>
            </Pressable>
          )}
        </View>

        {visibleFunctions.length === 0 && (
          <View style={{ marginHorizontal: 20, padding: 32, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 10 }}>
            <Feather name="calendar" size={32} color={colors.mutedForeground} />
            <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground }}>No functions showing</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" }}>
              {isManager ? 'Tap "Add Event" to create your first function.' : isTeamLeader && hiddenForLeader.length > 0 ? "All functions are hidden. Tap the eye button below to show them." : "Check with your manager for today's schedule."}
            </Text>
          </View>
        )}

        {isManager ? (
          /* ══════════════════════════════════════════════════
             MANAGER VIEW — full two-part structured cards
             ══════════════════════════════════════════════════ */
          visibleFunctions.map((fn) => {
            const tc = getFunctionTypeColor(fn.functionType);
            const dietaryReqs = fn.dietaryRequirements ?? [];
            const totalDietary = dietaryReqs.reduce((n, r) => n + r.count, 0);
            const activeTimes: Array<{ label: string; time: string }> = fn.serviceEvents && fn.serviceEvents.length > 0
              ? fn.serviceEvents
              : fn.serviceTimes
                ? (["amuse", "entree", "main", "dessert", "supper"] as const)
                    .filter((k) => fn.serviceTimes![k])
                    .map((k) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), time: fn.serviceTimes![k]! }))
                : [];
            const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
            const prepDone = fnPrep.filter((p) => p.completed).length;
            const prepPct = fnPrep.length > 0 ? prepDone / fnPrep.length : 0;

            return (
              <View key={fn.id} style={s.card}>

                {/* ── HEADER: name + type + count + location ─── */}
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}
                  style={({ pressed }) => [{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
                >
                  {/* Meta chips row */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    <View style={{ backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7 }}>
                      <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" }}>{fn.startTime}–{fn.endTime}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: tc + "20", borderWidth: 1, borderColor: tc + "50" }}>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: tc }}>{fn.functionType}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: colors.secondary, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 }}>
                      <Ionicons name="people" size={10} color={colors.mutedForeground} />
                      <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{fn.guestCount} guests</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Feather name="edit-2" size={13} color={colors.mutedForeground} />
                      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Edit</Text>
                    </View>
                  </View>
                  {/* Function name */}
                  <Text style={{ fontSize: 19, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 }}>{fn.name}</Text>
                  {/* Location */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <MaterialCommunityIcons name="door" size={13} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{fn.room}</Text>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>·</Text>
                    <Ionicons name="layers-outline" size={12} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{fn.floor}</Text>
                    {fnPrep.length > 0 && (
                      <>
                        <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>·</Text>
                        <Feather name="check-square" size={12} color={prepPct >= 1 ? colors.accent : colors.warning} />
                        <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: prepPct >= 1 ? colors.accent : colors.warning }}>
                          {prepDone}/{fnPrep.length} ready
                        </Text>
                      </>
                    )}
                  </View>
                </Pressable>

                {/* ── PART 1: MENU & SERVICE ────────────────── */}
                <View style={{ marginHorizontal: 12, marginTop: 12, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, overflow: "hidden" }}>
                  {/* Part 1 header */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.secondary }}>
                    <Feather name="coffee" size={12} color={colors.primary} />
                    <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.primary, letterSpacing: 0.8, textTransform: "uppercase" }}>Part 1 — Menu &amp; Service</Text>
                  </View>

                  {/* Menu items */}
                  {fn.menu.length > 0 ? (
                    <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10 }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>Menu</Text>
                      {fn.menu.map((item, i) => (
                        <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: i < fn.menu.length - 1 ? 5 : 0 }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tc, marginTop: 7 }} />
                          <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, flex: 1, lineHeight: 20 }}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
                      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, fontStyle: "italic" }}>No menu added — tap Edit to add dishes</Text>
                    </View>
                  )}

                  {/* Dietary options present */}
                  {dietaryReqs.length > 0 && (
                    <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>Dietary options present</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {dietaryReqs.map((req, i) => {
                          const tag = getDietaryTag(req.name);
                          const col = getDietaryColor(req.name);
                          return (
                            <View key={i} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, backgroundColor: col + "18", borderWidth: 1, borderColor: col + "50" }}>
                              <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: col }}>{tag}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Service milestones — timeline rows: time left, label right */}
                  {activeTimes.length > 0 && (
                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>Service milestones</Text>
                      {activeTimes.map((c, i) => (
                        <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <View style={{ width: 52, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6, backgroundColor: tc + "20", borderWidth: 1, borderColor: tc + "50", alignItems: "center", marginRight: 10 }}>
                            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: tc }}>{c.time}</Text>
                          </View>
                          <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground, flex: 1 }}>{c.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {activeTimes.length === 0 && fn.menu.length === 0 && (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, fontStyle: "italic" }}>No service milestones set — tap Edit to add</Text>
                    </View>
                  )}
                </View>

                {/* ── PART 2: DIETARY REQUESTS ─────────────── */}
                <View style={{ marginHorizontal: 12, marginBottom: 12, borderRadius: 10, borderWidth: 1, borderColor: dietaryReqs.length > 0 ? "#F59E0B45" : colors.border, backgroundColor: dietaryReqs.length > 0 ? "#F59E0B06" : colors.background, overflow: "hidden" }}>
                  {/* Part 2 header */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: dietaryReqs.length > 0 ? "#F59E0B30" : colors.border, backgroundColor: dietaryReqs.length > 0 ? "#F59E0B12" : colors.secondary }}>
                    <Ionicons name="warning-outline" size={13} color={dietaryReqs.length > 0 ? "#D97706" : colors.mutedForeground} />
                    <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: dietaryReqs.length > 0 ? "#D97706" : colors.mutedForeground, letterSpacing: 0.8, textTransform: "uppercase" }}>
                      Part 2 — Dietary Requests
                    </Text>
                    {totalDietary > 0 && (
                      <View style={{ marginLeft: "auto", paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#F59E0B20", borderRadius: 8 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "#B45309" }}>{totalDietary} guests</Text>
                      </View>
                    )}
                  </View>

                  {dietaryReqs.length === 0 ? (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 14 }}>
                      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, fontStyle: "italic" }}>No dietary requirements recorded — tap Edit to add</Text>
                    </View>
                  ) : (
                    dietaryReqs.map((req, i) => {
                      const pct = fn.guestCount > 0 ? Math.min(req.count / fn.guestCount, 1) : 0;
                      const col = getDietaryColor(req.name);
                      const isLast = i === dietaryReqs.length - 1;
                      return (
                        <View key={i} style={{ paddingHorizontal: 12, paddingTop: 11, paddingBottom: 11, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: "#F59E0B25" }}>
                          {/* Name + count */}
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 }}>
                            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: col }} />
                            <Text style={{ flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#78350F" }}>{req.name}</Text>
                            <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: "#B45309", lineHeight: 22 }}>{req.count}</Text>
                            <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "#92400E" }}>guests</Text>
                          </View>
                          {/* Progress bar */}
                          <View style={{ height: 6, backgroundColor: "#FDE68A", borderRadius: 3, overflow: "hidden", marginBottom: 7 }}>
                            <View style={{ height: 6, width: `${pct * 100}%`, backgroundColor: col, borderRadius: 3 }} />
                          </View>
                          {/* Note / description */}
                          {req.note ? (
                            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                              <Feather name="file-text" size={12} color="#92400E" style={{ marginTop: 2 }} />
                              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: "#92400E", flex: 1, lineHeight: 18, fontStyle: "italic" }}>{req.note}</Text>
                            </View>
                          ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                              <Feather name="edit-3" size={11} color="#D97706" />
                              <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "#D97706" }}>Chef's choice — tap Edit to add menu description</Text>
                            </View>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>

                {/* Open full details */}
                <Pressable style={({ pressed }) => [s.viewBtn, pressed && { opacity: 0.8 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}>
                  <Text style={s.viewBtnText}>Open full details</Text>
                  <Feather name="arrow-right" size={15} color="#fff" />
                </Pressable>
              </View>
            );
          })
        ) : (
          /* ══════════════════════════════════════════════════
             STAFF / TEAM LEADER — compact "where to go" cards
             ══════════════════════════════════════════════════ */
          <>
          {visibleFunctions.map((fn) => {
            const tc = getFunctionTypeColor(fn.functionType);
            const mySection = currentMember?.section;
            const fnTeamStaff = staff.filter((st) => fn.teamIds.includes(st.id) && st.section === mySection);
            const myLeader = fnTeamStaff.find((st) => !!st.teamLeadFor) ?? null;
            const dietaryReqs = fn.dietaryRequirements ?? [];
            const hasDietary = dietaryReqs.length > 0;
            const canHide = isTeamLeader && hidableIds.has(fn.id);
            return (
              <View key={fn.id} style={s.card}>
                {/* Time + name */}
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}
                  style={({ pressed }) => [s.cardTop, { borderBottomWidth: 0, paddingBottom: 0, opacity: pressed ? 0.85 : 1 }]}>
                  <View style={s.cardTopRow}>
                    <View style={s.timePill}><Text style={s.timePillText}>{fn.startTime}</Text></View>
                    <Text style={s.cardName} numberOfLines={1}>{fn.name}</Text>
                    {canHide ? (
                      <Pressable
                        hitSlop={10}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); hideFunction(fn.id); }}
                        style={{ padding: 4 }}
                      >
                        <Feather name="eye-off" size={16} color={colors.mutedForeground} />
                      </Pressable>
                    ) : (
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                    )}
                  </View>
                </Pressable>
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
                    <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>{mySection ?? (fn.chefInCharge ? fn.chefInCharge : "Team not yet assigned")}</Text>
                    {myLeader ? (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>Leader: {myLeader.name}{myLeader.phone ? ` · ${myLeader.phone}` : ""}</Text>
                    ) : fn.chefInCharge ? (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>Chef in Charge: {fn.chefInCharge}</Text>
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
              </View>
            );
          })}

          {/* ── Hidden functions — team leader can restore ── */}
          {isTeamLeader && hiddenForLeader.length > 0 && (
            <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
                Hidden from your view ({hiddenForLeader.length})
              </Text>
              {hiddenForLeader.map((fn) => (
                <Pressable
                  key={fn.id}
                  style={({ pressed }) => [{
                    flexDirection: "row", alignItems: "center", gap: 10, opacity: pressed ? 0.7 : 1,
                    backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border,
                    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
                  }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showFunction(fn.id); }}
                >
                  <Feather name="eye" size={15} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>{fn.name}</Text>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{fn.startTime}–{fn.endTime} · {fn.room}</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.primary }}>Show</Text>
                </Pressable>
              ))}
            </View>
          )}
          </>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
