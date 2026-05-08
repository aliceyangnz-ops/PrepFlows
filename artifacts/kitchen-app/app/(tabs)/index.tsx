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
import { BroadcastMessage, useKitchen } from "@/context/KitchenContext";
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

function formatRelativeTime(isoString: string): string {
  const sent = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - sent.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return sent.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

const MANAGER_ROLES = ["Head Chef", "Sous Chef", "Pastry Chef"];

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
  const isManager = currentMember ? MANAGER_ROLES.includes(currentMember.role) : false;
  const myFunctions = currentMember
    ? functions.filter((f) => currentMember.functionIds.includes(f.id))
    : [];

  const totalPrep = prepItems.length;
  const completedPrep = prepItems.filter((p) => p.completed).length;
  const prepPercent = totalPrep > 0 ? completedPrep / totalPrep : 0;

  const nextFunction = (() => {
    const pool = currentMember ? myFunctions : functions;
    return pool
      .filter((f) => timeToMinutes(f.startTime) > nowMinutes)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0];
  })();
  const minutesUntilNext = nextFunction ? timeToMinutes(nextFunction.startTime) - nowMinutes : null;

  const showBroadcast =
    broadcastMessage !== null &&
    broadcastMessage.id !== dismissedBroadcastId;

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
    Alert.alert(
      "Cancel alert",
      "Remove this broadcast for all staff?",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            clearBroadcast();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: currentMember ? 8 : 16,
      flexDirection: "row",
      alignItems: "flex-end",
    },
    headerLeft: { flex: 1 },
    dateLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" },
    headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2 },
    broadcastBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    broadcastBanner: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      overflow: "hidden",
    },
    broadcastTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 14,
      gap: 10,
    },
    broadcastIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    broadcastBody: { flex: 1 },
    broadcastLabel: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 1.1,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    broadcastText: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
    broadcastMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
    broadcastActions: {
      flexDirection: "row",
      borderTopWidth: 1,
    },
    broadcastActionBtn: {
      flex: 1,
      paddingVertical: 11,
      alignItems: "center",
      justifyContent: "center",
    },
    broadcastActionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
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
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 24,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 4,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    modalTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    modalSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    modalCloseBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    inputWrap: {
      margin: 16,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      minHeight: 100,
    },
    textInput: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 22,
    },
    charCount: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right", marginRight: 16, marginTop: -8, marginBottom: 8 },
    sendBtn: {
      marginHorizontal: 16,
      marginTop: 4,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    sendBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
    tipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginHorizontal: 16,
      marginTop: 12,
    },
    tipText: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, flex: 1 },
  });

  const accentAmber = "#F59E0B";

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
              style={({ pressed }) => [
                s.broadcastBtn,
                {
                  backgroundColor: showBroadcast ? accentAmber + "25" : colors.card,
                  borderWidth: 1,
                  borderColor: showBroadcast ? accentAmber + "60" : colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              onPress={openCompose}
            >
              <Ionicons
                name="megaphone"
                size={18}
                color={showBroadcast ? accentAmber : colors.mutedForeground}
              />
            </Pressable>
          )}
        </View>

        {showBroadcast && broadcastMessage && (
          <View style={[s.broadcastBanner, { backgroundColor: accentAmber + "12", borderColor: accentAmber + "50" }]}>
            <View style={s.broadcastTop}>
              <View style={[s.broadcastIconWrap, { backgroundColor: accentAmber + "25" }]}>
                <Ionicons name="megaphone" size={16} color={accentAmber} />
              </View>
              <View style={s.broadcastBody}>
                <Text style={[s.broadcastLabel, { color: accentAmber }]}>All-Staff Alert</Text>
                <Text style={[s.broadcastText, { color: colors.foreground }]}>{broadcastMessage.text}</Text>
                <Text style={[s.broadcastMeta, { color: colors.mutedForeground }]}>
                  {broadcastMessage.senderName} · {broadcastMessage.senderRole} · {formatRelativeTime(broadcastMessage.sentAt)}
                </Text>
              </View>
            </View>
            <View style={[s.broadcastActions, { borderTopColor: accentAmber + "30" }]}>
              {isManager ? (
                <>
                  <Pressable
                    style={({ pressed }) => [s.broadcastActionBtn, { opacity: pressed ? 0.7 : 1, borderRightWidth: 1, borderRightColor: accentAmber + "30" }]}
                    onPress={openCompose}
                  >
                    <Text style={[s.broadcastActionText, { color: colors.info }]}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [s.broadcastActionBtn, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={handleClearBroadcast}
                  >
                    <Text style={[s.broadcastActionText, { color: colors.destructive ?? "#EF4444" }]}>Cancel alert</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={({ pressed }) => [s.broadcastActionBtn, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    dismissBroadcast(broadcastMessage.id);
                  }}
                >
                  <Text style={[s.broadcastActionText, { color: colors.mutedForeground }]}>Got it</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

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

      <Modal
        visible={composeVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setComposeVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setComposeVisible(false)}>
          <View style={s.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : undefined}>
              <TouchableWithoutFeedback>
                <View style={s.modalSheet}>
                  <View style={s.modalHandle} />
                  <View style={s.modalHeader}>
                    <Ionicons name="megaphone" size={20} color={accentAmber} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.modalTitle}>Broadcast to all staff</Text>
                      {currentMember && (
                        <Text style={s.modalSubtitle}>Sending as {currentMember.name} · {currentMember.role}</Text>
                      )}
                    </View>
                    <Pressable
                      style={({ pressed }) => [s.modalCloseBtn, { opacity: pressed ? 0.6 : 1 }]}
                      onPress={() => setComposeVisible(false)}
                    >
                      <Feather name="x" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>

                  <Pressable style={s.inputWrap} onPress={() => inputRef.current?.focus()}>
                    <TextInput
                      ref={inputRef}
                      style={s.textInput}
                      placeholder="Type your message to all kitchen staff…"
                      placeholderTextColor={colors.mutedForeground}
                      multiline
                      maxLength={200}
                      value={draftText}
                      onChangeText={setDraftText}
                      autoFocus
                    />
                  </Pressable>
                  <Text style={[s.charCount, { color: draftText.length > 160 ? colors.warning : colors.mutedForeground }]}>
                    {draftText.length}/200
                  </Text>

                  <Pressable
                    style={({ pressed }) => [
                      s.sendBtn,
                      {
                        backgroundColor: draftText.trim().length > 0 ? accentAmber : colors.secondary,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                    onPress={sendBroadcast}
                    disabled={draftText.trim().length === 0}
                  >
                    <Ionicons name="megaphone" size={16} color={draftText.trim().length > 0 ? "#fff" : colors.mutedForeground} />
                    <Text style={[s.sendBtnText, { color: draftText.trim().length > 0 ? "#fff" : colors.mutedForeground }]}>
                      Send to all staff
                    </Text>
                  </Pressable>

                  <View style={s.tipRow}>
                    <Ionicons name="information-circle-outline" size={14} color={colors.mutedForeground} />
                    <Text style={s.tipText}>
                      The alert banner appears on every device when staff open the app today.
                    </Text>
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
