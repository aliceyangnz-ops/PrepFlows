import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BroadcastMessage, FunctionType, getAccessLevel, useKitchen } from "@/context/KitchenContext";
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

function formatRelativeTime(isoString: string): string {
  const sent = new Date(isoString);
  const diffMin = Math.floor((Date.now() - sent.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  return diffH < 24 ? `${diffH}h ago` : sent.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

const AMBER = "#F59E0B";

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    functions, prepItems, staff, todayDate,
    currentStaffId, notificationsEnabled,
    broadcastMessage, dismissedBroadcastId,
    setBroadcast, clearBroadcast, dismissBroadcast,
  } = useKitchen();

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const isManager = currentMember ? getAccessLevel(currentMember) === "manager" : false;
  const myFunctions = currentMember ? functions.filter((f) => currentMember.functionIds.includes(f.id)) : [];

  const totalPrep = prepItems.length;
  const completedPrep = prepItems.filter((p) => p.completed).length;
  const prepPercent = totalPrep > 0 ? completedPrep / totalPrep : 0;

  const showBroadcast = broadcastMessage !== null && broadcastMessage.id !== dismissedBroadcastId;
  const [composeVisible, setComposeVisible] = useState(false);
  const [draftText, setDraftText] = useState("");
  const inputRef = useRef<TextInput>(null);

  function openCompose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDraftText("");
    setComposeVisible(true);
  }

  function sendBroadcast() {
    const trimmed = draftText.trim();
    if (!trimmed || !currentMember) return;
    const msg: BroadcastMessage = {
      id: Date.now().toString(),
      text: trimmed,
      senderName: currentMember.name,
      senderRole: currentMember.role,
      sentAt: new Date().toISOString(),
    };
    setBroadcast(msg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setComposeVisible(false);
    setDraftText("");
  }

  function handleClearBroadcast() {
    Alert.alert("Remove alert?", "This will remove the message for all staff.", [
      { text: "Keep it", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => { clearBroadcast(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
    ]);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    header: { paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "flex-end" },
    headerLeft: { flex: 1 },
    dateLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" },
    headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2 },
    megaBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 4, borderWidth: 1 },
    broadcastBanner: { marginHorizontal: 20, marginBottom: 14, borderRadius: colors.radius, borderWidth: 1.5, overflow: "hidden" },
    broadcastTop: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 10 },
    broadcastIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 1 },
    broadcastBody: { flex: 1 },
    broadcastLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 4 },
    broadcastText: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 21, color: colors.foreground },
    broadcastMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 5, color: colors.mutedForeground },
    broadcastActions: { flexDirection: "row", borderTopWidth: 1 },
    broadcastBtn: { flex: 1, paddingVertical: 11, alignItems: "center" },
    broadcastBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    glanceCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    glanceHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.secondary },
    glanceHeaderText: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1 },
    glanceRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    glanceTime: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.primary, width: 46 },
    glanceInfo: { flex: 1 },
    glanceName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    glanceSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    glanceTypePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    glanceTypeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    glancePax: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignItems: "center" },
    glancePaxNum: { fontSize: 14, fontFamily: "Inter_700Bold" },
    glancePaxLabel: { fontSize: 9, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
    myCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: colors.radius, borderWidth: 1, overflow: "hidden" },
    myCardHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
    myAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    myAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
    myName: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    myRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    notifPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    notifPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    myDivider: { height: 1 },
    myEvents: { padding: 12, gap: 8 },
    myEventRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    myEventTime: { fontSize: 13, fontFamily: "Inter_700Bold" },
    myEventName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    myEventSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, textTransform: "uppercase", marginHorizontal: 20, marginBottom: 10 },
    progressCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.card, borderRadius: colors.radius, padding: 16, borderWidth: 1, borderColor: colors.border },
    progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    progressLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    progressCount: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
    fnCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: colors.card, borderRadius: colors.radius, padding: 16, borderWidth: 1, borderColor: colors.border },
    fnRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    fnTime: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary, width: 52 },
    fnName: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    fnTypeLine: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    fnTypePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    fnTypeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    fnMeta: { flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" },
    chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    chipText: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    teamRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
    avatar: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    avatarText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 24, borderTopWidth: 1, borderColor: colors.border },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginTop: 12, marginBottom: 4 },
    sheetHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    sheetTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    sheetSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
    inputWrap: { margin: 16, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 100 },
    textInput: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22 },
    charCount: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right", marginRight: 16, marginTop: -8, marginBottom: 8 },
    sendBtn: { marginHorizontal: 16, marginTop: 4, borderRadius: 12, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
    sendBtnText: { fontSize: 15, fontFamily: "Inter_700Bold" },
    tipRow: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, marginTop: 12 },
    tipText: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, flex: 1 },
  });

  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.dateLabel}>{todayDate}</Text>
            <Text style={s.headerTitle}>Today's Service</Text>
          </View>
          {isManager && (
            <Pressable
              style={({ pressed }) => [s.megaBtn, { backgroundColor: showBroadcast ? AMBER + "25" : colors.card, borderColor: showBroadcast ? AMBER + "60" : colors.border, opacity: pressed ? 0.75 : 1 }]}
              onPress={openCompose}
            >
              <Ionicons name="megaphone" size={18} color={showBroadcast ? AMBER : colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {showBroadcast && broadcastMessage && (
          <View style={[s.broadcastBanner, { backgroundColor: AMBER + "12", borderColor: AMBER + "50" }]}>
            <View style={s.broadcastTop}>
              <View style={[s.broadcastIconWrap, { backgroundColor: AMBER + "25" }]}>
                <Ionicons name="megaphone" size={16} color={AMBER} />
              </View>
              <View style={s.broadcastBody}>
                <Text style={[s.broadcastLabel, { color: AMBER }]}>Message to all staff</Text>
                <Text style={s.broadcastText}>{broadcastMessage.text}</Text>
                <Text style={s.broadcastMeta}>From: {broadcastMessage.senderName} · {broadcastMessage.senderRole} · {formatRelativeTime(broadcastMessage.sentAt)}</Text>
              </View>
            </View>
            <View style={[s.broadcastActions, { borderTopColor: AMBER + "30" }]}>
              {isManager ? (
                <>
                  <Pressable style={({ pressed }) => [s.broadcastBtn, { opacity: pressed ? 0.7 : 1, borderRightWidth: 1, borderRightColor: AMBER + "30" }]} onPress={openCompose}>
                    <Text style={[s.broadcastBtnText, { color: colors.info }]}>Edit</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [s.broadcastBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={handleClearBroadcast}>
                    <Text style={[s.broadcastBtnText, { color: "#EF4444" }]}>Remove alert</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={({ pressed }) => [s.broadcastBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); dismissBroadcast(broadcastMessage.id); }}>
                  <Text style={[s.broadcastBtnText, { color: colors.mutedForeground }]}>Got it</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {isManager && (
          <View style={s.glanceCard}>
            <View style={s.glanceHeader}>
              <Feather name="list" size={14} color={colors.primary} />
              <Text style={s.glanceHeaderText}>All Events Today — Quick View</Text>
            </View>
            {functions.map((fn, idx) => {
              const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
              const prepDone = fnPrep.filter((p) => p.completed).length;
              const tc = getFunctionTypeColor(fn.functionType);
              return (
                <Pressable
                  key={fn.id}
                  style={({ pressed }) => [s.glanceRow, { borderBottomWidth: idx === functions.length - 1 ? 0 : 1, opacity: pressed ? 0.75 : 1 }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}
                >
                  <Text style={s.glanceTime}>{fn.startTime}</Text>
                  <View style={s.glanceInfo}>
                    <Text style={s.glanceName} numberOfLines={1}>{fn.name}</Text>
                    <Text style={s.glanceSub}>Room: {fn.room}  ·  Food ready: {prepDone}/{fnPrep.length}</Text>
                  </View>
                  <View style={[s.glanceTypePill, { backgroundColor: tc + "22" }]}>
                    <Text style={[s.glanceTypeText, { color: tc }]}>{fn.functionType}</Text>
                  </View>
                  <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
                </Pressable>
              );
            })}
          </View>
        )}

        {currentMember && (() => {
          const rc = getRoleColor(currentMember.role, colors);
          return (
            <View style={[s.myCard, { backgroundColor: rc + "10", borderColor: rc + "40" }]}>
              <View style={s.myCardHeader}>
                <View style={[s.myAvatar, { backgroundColor: rc + "30" }]}>
                  <Text style={[s.myAvatarText, { color: rc }]}>{currentMember.name.split(" ").map((n) => n[0]).join("")}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.myName}>{currentMember.name}</Text>
                  <Text style={[s.myRole, { color: rc }]}>{currentMember.role} · Shift {currentMember.shiftStart}–{currentMember.shiftEnd}</Text>
                </View>
                <View style={[s.notifPill, { backgroundColor: notificationsEnabled ? colors.accent + "20" : colors.secondary }]}>
                  <Ionicons name={notificationsEnabled ? "notifications" : "notifications-off"} size={12} color={notificationsEnabled ? colors.accent : colors.mutedForeground} />
                  <Text style={[s.notifPillText, { color: notificationsEnabled ? colors.accent : colors.mutedForeground }]}>
                    {notificationsEnabled ? "Alerts on" : "No alerts"}
                  </Text>
                </View>
              </View>
              {myFunctions.length > 0 && (
                <>
                  <View style={[s.myDivider, { backgroundColor: rc + "30" }]} />
                  <View style={s.myEvents}>
                    {myFunctions.map((fn) => {
                      const tc = getFunctionTypeColor(fn.functionType);
                      return (
                        <Pressable key={fn.id} style={({ pressed }) => [s.myEventRow, { backgroundColor: rc + "12", borderColor: rc + "30" }, pressed && { opacity: 0.8 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}>
                          <Text style={[s.myEventTime, { color: rc }]}>{fn.startTime}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.myEventName} numberOfLines={1}>{fn.name}</Text>
                            <Text style={s.myEventSub}>Room: {fn.room} · {fn.guestCount} guests</Text>
                          </View>
                          <View style={[s.glanceTypePill, { backgroundColor: tc + "22" }]}>
                            <Text style={[s.glanceTypeText, { color: tc }]}>{fn.functionType}</Text>
                          </View>
                          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          );
        })()}

        <Text style={s.sectionLabel}>Food Prep Progress</Text>
        <View style={s.progressCard}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Tasks complete today</Text>
            <Text style={s.progressCount}>{completedPrep} of {totalPrep} done</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${prepPercent * 100}%` }]} />
          </View>
        </View>

        <Text style={s.sectionLabel}>All Events</Text>
        {functions.map((fn) => {
          const fnStaff = staff.filter((st) => fn.teamIds.includes(st.id));
          const tc = getFunctionTypeColor(fn.functionType);
          return (
            <Pressable key={fn.id} style={({ pressed }) => [s.fnCard, pressed && { opacity: 0.8 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/function/${fn.id}`); }}>
              <View style={s.fnRow}>
                <Text style={s.fnTime}>{fn.startTime}</Text>
                <Text style={s.fnName} numberOfLines={1}>{fn.name}</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
              <View style={s.fnTypeLine}>
                <View style={[s.fnTypePill, { backgroundColor: tc + "22" }]}>
                  <Text style={[s.fnTypeText, { color: tc }]}>{fn.functionType}</Text>
                </View>
                {fn.functionType === "A-la-carte" && fn.serviceTimes && (
                  <>
                    {fn.serviceTimes.entree && <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Ent: {fn.serviceTimes.entree}</Text>}
                    {fn.serviceTimes.main && <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Main: {fn.serviceTimes.main}</Text>}
                    {fn.serviceTimes.dessert && <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Des: {fn.serviceTimes.dessert}</Text>}
                  </>
                )}
              </View>
              <View style={s.fnMeta}>
                <View style={s.chip}>
                  <MaterialCommunityIcons name="door" size={12} color={colors.mutedForeground} />
                  <Text style={s.chipText}>Room: {fn.room}</Text>
                </View>
                <View style={s.chip}>
                  <Ionicons name="people" size={12} color={colors.mutedForeground} />
                  <Text style={s.chipText}>{fn.guestCount} guests</Text>
                </View>
              </View>
              <View style={s.teamRow}>
                {fnStaff.map((member) => (
                  <View key={member.id} style={[s.avatar, { backgroundColor: getRoleColor(member.role, colors) + "25", borderWidth: currentStaffId === member.id ? 1.5 : 0, borderColor: getRoleColor(member.role, colors) }]}>
                    <Text style={[s.avatarText, { color: getRoleColor(member.role, colors) }]}>{member.name.split(" ").map((n) => n[0]).join("")}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
        <View style={s.bottomPad} />
      </ScrollView>

      <Modal visible={composeVisible} transparent animationType="slide" onRequestClose={() => setComposeVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setComposeVisible(false)}>
          <View style={s.overlay}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : undefined}>
              <TouchableWithoutFeedback>
                <View style={s.sheet}>
                  <View style={s.handle} />
                  <View style={s.sheetHeader}>
                    <Ionicons name="megaphone" size={20} color={AMBER} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.sheetTitle}>Send message to all staff</Text>
                      {currentMember && <Text style={s.sheetSub}>From: {currentMember.name} · {currentMember.role}</Text>}
                    </View>
                    <Pressable style={({ pressed }) => [s.closeBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={() => setComposeVisible(false)}>
                      <Feather name="x" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                  <Pressable style={s.inputWrap} onPress={() => inputRef.current?.focus()}>
                    <TextInput ref={inputRef} style={s.textInput} placeholder="Type your message here…" placeholderTextColor={colors.mutedForeground} multiline maxLength={200} value={draftText} onChangeText={setDraftText} autoFocus />
                  </Pressable>
                  <Text style={[s.charCount, { color: draftText.length > 160 ? colors.warning : colors.mutedForeground }]}>{draftText.length}/200</Text>
                  <Pressable style={({ pressed }) => [s.sendBtn, { backgroundColor: draftText.trim().length > 0 ? AMBER : colors.secondary, opacity: pressed ? 0.85 : 1 }]} onPress={sendBroadcast} disabled={draftText.trim().length === 0}>
                    <Ionicons name="megaphone" size={16} color={draftText.trim().length > 0 ? "#fff" : colors.mutedForeground} />
                    <Text style={[s.sendBtnText, { color: draftText.trim().length > 0 ? "#fff" : colors.mutedForeground }]}>Send to all staff</Text>
                  </Pressable>
                  <View style={s.tipRow}>
                    <Ionicons name="information-circle-outline" size={14} color={colors.mutedForeground} />
                    <Text style={s.tipText}>Staff will see this message when they open the app.</Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
