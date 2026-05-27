import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAccessLevel, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatClock(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function elapsed(startedAt: number): string {
  const s = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

type SectionStatus = "READY" | "PLATING" | "HOLDING" | "DONE";

interface ServiceLog {
  time: string;
  text: string;
  variant: "normal" | "highlight" | "success" | "warn";
}

export default function LiveServiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { functions, staff, currentStaffId, toggleTimelineItem } = useKitchen();

  const fn = functions.find((f) => f.id === id);
  const currentMember = staff.find((s) => s.id === currentStaffId) ?? null;
  const accessLevel = currentMember ? getAccessLevel(currentMember) : "staff";
  const canFire = accessLevel === "manager" || accessLevel === "team_leader";

  const [clock, setClock] = useState(new Date());
  const [courseIdx, setCourseIdx] = useState(0);
  const [firingTimer, setFiringTimer] = useState<number | null>(null);
  const [held, setHeld] = useState(false);
  const [logs, setLogs] = useState<ServiceLog[]>([
    {
      time: formatClock(new Date()),
      text: "Service started",
      variant: "highlight",
    },
  ]);
  const [sectionStatus, setSectionStatus] = useState<
    Record<string, SectionStatus>
  >({
    "HOT SECTION": "READY",
    "COLD SECTION": "READY",
    PASTRY: "PLATING",
    EXPO: "HOLDING",
  });

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!fn) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0D1117",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#F0F6FC", fontFamily: "Inter_600SemiBold" }}>
          Function not found
        </Text>
      </View>
    );
  }

  const courses =
    fn.serviceEvents && fn.serviceEvents.length > 0
      ? fn.serviceEvents.map((e) => e.label)
      : fn.serviceTimes
        ? (["amuse", "entree", "main", "dessert", "supper"] as const)
            .filter((k) => fn.serviceTimes![k])
            .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
        : ["Entrée", "Main", "Dessert"];

  function addLog(text: string, variant: ServiceLog["variant"] = "normal") {
    const entry: ServiceLog = { time: formatClock(new Date()), text, variant };
    setLogs((prev) => [entry, ...prev]);
  }

  function handleFire() {
    if (!canFire) {
      Alert.alert(
        "Access denied",
        "Only managers and team leaders can fire courses.",
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const courseName = courses[courseIdx] ?? "Course";
    addLog(`Fire ${courseName} confirmed`, "highlight");
    setFiringTimer(Date.now());
    setHeld(false);
    if (courseIdx < courses.length - 1) {
      setCourseIdx((c) => c + 1);
    }
  }

  function handleHold() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !held;
    setHeld(next);
    addLog(
      next ? "HOLD called — pause service" : "Hold released",
      next ? "warn" : "normal",
    );
  }

  function handleAnnounce() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addLog("Announcement made to section", "normal");
  }

  function cycleSection(key: string) {
    const order: SectionStatus[] = ["READY", "PLATING", "HOLDING", "DONE"];
    setSectionStatus((prev) => {
      const curr = prev[key] ?? "READY";
      const next = order[(order.indexOf(curr) + 1) % order.length];
      addLog(
        `${key}: ${next}`,
        next === "READY" || next === "DONE" ? "success" : "normal",
      );
      return { ...prev, [key]: next };
    });
    Haptics.selectionAsync();
  }

  function sectionColor(status: SectionStatus): string {
    switch (status) {
      case "READY":
        return "#22C55E";
      case "PLATING":
        return "#F97316";
      case "HOLDING":
        return "#EF4444";
      case "DONE":
        return "#8B949E";
    }
  }

  const sectionBorder = (status: SectionStatus) =>
    status === "HOLDING" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)";

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0D1117" },
    liveBar: {
      borderTopWidth: 4,
      borderTopColor: "#F97316",
      backgroundColor: "#161B22",
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.08)",
    },
    liveLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#F97316",
    },
    liveLabel: {
      fontSize: 12,
      fontFamily: "Inter_700Bold",
      color: "#F97316",
      letterSpacing: 1,
    },
    fnName: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      marginTop: 2,
    },
    clockText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#F97316" },
    heroCard: {
      margin: 20,
      backgroundColor: "#161B22",
      borderRadius: 12,
      padding: 24,
      borderWidth: 1,
      borderColor: "rgba(249,115,22,0.3)",
      alignItems: "center",
      shadowColor: "#F97316",
      shadowOpacity: 0.1,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 0 },
    },
    courseLabel: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      letterSpacing: 1,
      marginBottom: 8,
    },
    timerText: {
      fontSize: 48,
      fontFamily: "Inter_700Bold",
      color: "#F97316",
      letterSpacing: 2,
      lineHeight: 52,
      marginBottom: 12,
    },
    courseMeta: {
      fontSize: 14,
      color: "#8B949E",
      fontFamily: "Inter_400Regular",
      marginBottom: 20,
    },
    courseProgress: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      position: "relative",
    },
    courseConnector: {
      position: "absolute",
      top: 11,
      left: "10%",
      right: "10%",
      height: 2,
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    courseStep: {
      alignItems: "center",
      gap: 8,
      zIndex: 1,
      backgroundColor: "#161B22",
      paddingHorizontal: 4,
    },
    courseStepDone: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#22C55E",
      alignItems: "center",
      justifyContent: "center",
    },
    courseStepActive: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#F97316",
      alignItems: "center",
      justifyContent: "center",
    },
    courseStepTodo: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#484F58",
      backgroundColor: "#161B22",
    },
    courseStepLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
    sectionLabel: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#8B949E",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
      marginHorizontal: 20,
    },
    sectionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginHorizontal: 20,
      marginBottom: 24,
    },
    sectionCard: {
      width: "47%",
      backgroundColor: "#161B22",
      borderRadius: 8,
      padding: 14,
      borderWidth: 1,
    },
    sectionCardTitle: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      marginBottom: 10,
    },
    sectionStatusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    sectionStatusText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    logCard: {
      marginHorizontal: 20,
      backgroundColor: "#161B22",
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      marginBottom: 24,
    },
    logEntry: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.04)",
    },
    logTime: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: "#484F58",
      width: 44,
    },
    logText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
    fireBtn: {
      marginHorizontal: 20,
      backgroundColor: "#F97316",
      borderRadius: 8,
      paddingVertical: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginBottom: 12,
      shadowColor: "#F97316",
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    fireBtnText: {
      fontSize: 18,
      fontFamily: "Inter_800ExtraBold",
      color: "#fff",
    },
    actionRow: {
      flexDirection: "row",
      gap: 12,
      marginHorizontal: 20,
      marginBottom: 24,
    },
    holdBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 8,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      flexDirection: "row",
    },
    holdBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
    announceBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      flexDirection: "row",
    },
    announceBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#F0F6FC",
    },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    backBtnText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: "#8B949E",
    },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 20 },
  });

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      <View style={s.liveBar}>
        <View style={s.liveLeft}>
          <View style={s.liveDot} />
          <View>
            <Text style={s.liveLabel}>LIVE SERVICE</Text>
            <Text style={s.fnName} numberOfLines={1}>
              {fn.name}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={s.clockText}>{formatClock(clock)}</Text>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Feather name="x" size={14} color="#8B949E" />
            <Text style={s.backBtnText}>Exit</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Course hero */}
        <View style={s.heroCard}>
          <Text style={s.courseLabel}>
            COURSE {Math.min(courseIdx + 1, courses.length)} OF {courses.length}{" "}
            — {(courses[courseIdx] ?? "").toUpperCase()}
          </Text>
          <Text style={s.timerText}>
            {firingTimer ? elapsed(firingTimer) : "00:00"}
          </Text>
          <Text style={s.courseMeta}>
            {courses[courseIdx] ?? ""} · {fn.guestCount} covers · {fn.startTime}
            –{fn.endTime}
          </Text>
          <View style={s.courseProgress}>
            <View style={s.courseConnector} />
            {courses.map((c, i) => (
              <View key={i} style={s.courseStep}>
                {i < courseIdx ? (
                  <View style={s.courseStepDone}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                ) : i === courseIdx ? (
                  <View style={s.courseStepActive}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#0D1117",
                      }}
                    />
                  </View>
                ) : (
                  <View style={s.courseStepTodo} />
                )}
                <Text
                  style={[
                    s.courseStepLabel,
                    {
                      color:
                        i < courseIdx
                          ? "#22C55E"
                          : i === courseIdx
                            ? "#F0F6FC"
                            : "#484F58",
                      fontFamily:
                        i === courseIdx ? "Inter_700Bold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section status */}
        <Text style={s.sectionLabel}>Section Status</Text>
        <View style={s.sectionGrid}>
          {Object.entries(sectionStatus).map(([key, status]) => (
            <Pressable
              key={key}
              style={[s.sectionCard, { borderColor: sectionBorder(status) }]}
              onPress={() => cycleSection(key)}
            >
              <Text style={s.sectionCardTitle}>{key}</Text>
              <View style={s.sectionStatusRow}>
                <Text style={{ color: sectionColor(status), fontSize: 16 }}>
                  ●
                </Text>
                <Text
                  style={[s.sectionStatusText, { color: sectionColor(status) }]}
                >
                  {status}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: "#484F58",
                  fontFamily: "Inter_400Regular",
                }}
              >
                Tap to update
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Service log */}
        <Text style={s.sectionLabel}>Service Log</Text>
        <View style={s.logCard}>
          {logs.slice(0, 8).map((log, i) => (
            <View
              key={i}
              style={[
                s.logEntry,
                i === logs.slice(0, 8).length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={s.logTime}>{log.time}</Text>
              <Text
                style={[
                  s.logText,
                  {
                    color:
                      log.variant === "highlight"
                        ? "#F0F6FC"
                        : log.variant === "success"
                          ? "#22C55E"
                          : log.variant === "warn"
                            ? "#EF4444"
                            : "#8B949E",
                    fontFamily:
                      log.variant === "highlight"
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                  },
                ]}
              >
                {log.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <Pressable
          style={({ pressed }) => [
            s.fireBtn,
            held && { backgroundColor: "#484F58" },
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleFire}
        >
          <Text style={{ fontSize: 20 }}>🔥</Text>
          <Text style={s.fireBtnText}>
            {held ? "HELD — FIRE BLOCKED" : "FIRE NEXT"}
          </Text>
        </Pressable>

        <View style={s.actionRow}>
          <Pressable
            style={[
              s.holdBtn,
              {
                borderColor: held ? "#EAB308" : "rgba(234,179,8,0.4)",
                backgroundColor: held ? "rgba(234,179,8,0.1)" : "transparent",
              },
            ]}
            onPress={handleHold}
          >
            <Ionicons
              name={held ? "pause" : "pause-outline"}
              size={18}
              color="#EAB308"
            />
            <Text style={[s.holdBtnText, { color: "#EAB308" }]}>
              {held ? "RELEASE" : "HOLD"}
            </Text>
          </Pressable>
          <Pressable style={s.announceBtn} onPress={handleAnnounce}>
            <Ionicons name="megaphone-outline" size={18} color="#F0F6FC" />
            <Text style={s.announceBtnText}>ANNOUNCE</Text>
          </Pressable>
        </View>

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
