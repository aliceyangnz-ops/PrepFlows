import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ACCESS_LEVEL_LABELS, AccessLevel, PrepTeam, StaffMember, getAccessLevel, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

type StaffRole = StaffMember["role"];

const ROLES: StaffRole[] = ["Head Chef", "Sous Chef", "Pastry Chef", "Function Captain", "Casual"];
const TEAMS: PrepTeam[] = ["Hot Kitchen", "Cold Larder", "Pastry", "Function Team", "Butchery"];
const ACCESS_OVERRIDES: Array<{ value: AccessLevel; label: string; desc: string }> = [
  { value: "manager",     label: "Manager",      desc: "Full edit — menu, times, dietary" },
  { value: "team_leader", label: "Team Leader",   desc: "Edit times + dietary only" },
  { value: "staff",       label: "Staff",         desc: "Read only" },
];

const TEAM_COLORS: Record<PrepTeam, string> = {
  "Hot Kitchen":   "#F97316",
  "Cold Larder":   "#3B82F6",
  "Pastry":        "#8B5CF6",
  "Function Team": "#22C55E",
  "Butchery":      "#EF4444",
};

const ROLE_COLORS: Record<StaffRole, string> = {
  "Head Chef":        "#F97316",
  "Sous Chef":        "#3B82F6",
  "Pastry Chef":      "#8B5CF6",
  "Function Captain": "#22C55E",
  "Casual":           "#F59E0B",
};

export default function StaffEditScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { staff, addStaff, updateStaff, removeStaff, currentStaffId } = useKitchen();
  const currentMember = currentStaffId ? staff.find((m) => m.id === currentStaffId) ?? null : null;
  const isManager = currentMember ? getAccessLevel(currentMember) === "manager" : false;

  const isNew = id === "new";
  const existing = isNew ? null : staff.find((m) => m.id === id) ?? null;

  const [name, setName]               = useState(existing?.name ?? "");
  const [staffNumber, setStaffNumber] = useState(existing?.staffNumber ?? "");
  const [phone, setPhone]             = useState(existing?.phone ?? "");
  const [pin, setPin]                 = useState(existing?.pin ?? "");
  const [role, setRole]               = useState<StaffRole>(existing?.role ?? "Casual");
  const [shiftStart, setShiftStart]   = useState(existing?.shiftStart ?? "08:00");
  const [shiftEnd, setShiftEnd]       = useState(existing?.shiftEnd ?? "16:00");
  const [section, setSection]         = useState<PrepTeam | undefined>(existing?.section);
  const [isTeamLead, setIsTeamLead]   = useState(!!existing?.teamLeadFor);
  const [accessOverride, setAccessOverride] = useState<AccessLevel | undefined>(existing?.accessLevel);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleSave() {
    if (!isManager && !isBootstrap) {
      Alert.alert("Access denied", "Only managers can add or edit staff members.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter the staff member's name.");
      return;
    }

    if (isNew) {
      const newMember: StaffMember = {
        id: `s_${Date.now()}`,
        staffNumber: staffNumber.trim() || `#${String(Math.floor(Math.random() * 9000) + 1000)}`,
        name: name.trim(),
        role,
        phone: phone.trim() || undefined,
        pin: pin.trim() || undefined,
        shiftStart: shiftStart.trim() || "08:00",
        shiftEnd: shiftEnd.trim() || "16:00",
        functionIds: [],
        section,
        teamLeadFor: isTeamLead && section ? section : undefined,
        accessLevel: accessOverride,
      };
      addStaff(newMember);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else if (existing) {
      updateStaff(existing.id, {
        name: name.trim(),
        staffNumber: staffNumber.trim() || existing.staffNumber,
        phone: phone.trim() || undefined,
        pin: pin.trim() || undefined,
        role,
        shiftStart: shiftStart.trim() || existing.shiftStart,
        shiftEnd: shiftEnd.trim() || existing.shiftEnd,
        section,
        teamLeadFor: isTeamLead && section ? section : undefined,
        accessLevel: accessOverride,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  }

  function handleDelete() {
    if (!existing) return;
    if (!isManager) {
      Alert.alert("Access denied", "Only managers can remove staff members.");
      return;
    }
    if (existing.id === currentStaffId) {
      Alert.alert(
        "Can't remove",
        "You can't remove yourself while signed in. Tap 'Not me' on the roster first.",
        [{ text: "OK" }]
      );
      return;
    }
    Alert.alert(
      `Remove ${existing.name.split(" ")[0]}?`,
      "They will be permanently removed from the roster. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove staff member",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            removeStaff(existing.id);
            router.back();
          },
        },
      ]
    );
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    toolbar: {
      position: "absolute", top: topPad + 8, left: 0, right: 0, zIndex: 10,
      flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      alignItems: "center", justifyContent: "center",
    },
    spacer: { flex: 1 },
    deleteBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
      borderWidth: 1, borderColor: "#EF444450",
    },
    saveBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
      backgroundColor: colors.accent,
    },
    saveBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    hero: {
      paddingTop: topPad + 62, paddingHorizontal: 20, paddingBottom: 20,
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    heroTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    body: { paddingHorizontal: 16, paddingTop: 16 },
    card: {
      borderRadius: colors.radius, borderWidth: 1.5, overflow: "hidden",
      marginBottom: 14,
    },
    cardHeader: {
      flexDirection: "row", alignItems: "center", gap: 8,
      paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
    },
    cardTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_700Bold" },
    fieldRow: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 50,
    },
    fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, width: 90 },
    fieldInput: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 10 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 14 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
    chipText: { fontSize: 12, fontFamily: "Inter_700Bold" },
    toggleRow: {
      flexDirection: "row", alignItems: "center", gap: 10,
      paddingHorizontal: 14, paddingVertical: 14,
    },
    toggleTrack: {
      width: 44, height: 26, borderRadius: 13, justifyContent: "center", padding: 2,
    },
    toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff" },
    toggleLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground },
    toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    accessRow: { padding: 14, gap: 8 },
    accessChip: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1.5 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 40 },
  });

  const isBootstrap = staff.length === 0;
  if (!isManager && !isBootstrap) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center", padding: 32 }]}>
        <Ionicons name="lock-closed" size={48} color={colors.mutedForeground} />
        <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 20, textAlign: "center" }}>
          Manager access only
        </Text>
        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 10, textAlign: "center", lineHeight: 22 }}>
          Only managers can add or edit staff members. Sign in as a manager on the Roster tab to continue.
        </Text>
        <Pressable
          style={{ marginTop: 24, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Toolbar */}
      <View style={s.toolbar}>
        <Pressable style={({ pressed }) => [s.backBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={s.spacer} />
        {!isNew && (
          <Pressable style={({ pressed }) => [s.deleteBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={handleDelete}>
            <Feather name="trash-2" size={14} color="#EF4444" />
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#EF4444" }}>Remove</Text>
          </Pressable>
        )}
        <Pressable style={({ pressed }) => [s.saveBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={handleSave}>
          <Feather name="check" size={14} color="#fff" />
          <Text style={s.saveBtnText}>{isNew ? "Add Staff" : "Save"}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>{isNew ? "Add Staff Member" : "Edit Staff Member"}</Text>
          <Text style={s.heroSub}>
            {isNew ? "Fill in their details — they can select themselves on the Roster tab" : `Editing ${existing?.name ?? ""}`}
          </Text>
        </View>

        <View style={s.body}>
          {/* Basic details */}
          <View style={[s.card, { borderColor: colors.primary + "60" }]}>
            <View style={[s.cardHeader, { backgroundColor: colors.primary + "15", borderBottomColor: colors.primary + "30" }]}>
              <Feather name="user" size={14} color={colors.primary} />
              <Text style={[s.cardTitle, { color: colors.primary }]}>Personal Details</Text>
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Full Name</Text>
              <TextInput
                style={s.fieldInput} value={name} onChangeText={setName}
                placeholder="e.g. Sarah Chen" placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Staff #</Text>
              <TextInput
                style={s.fieldInput} value={staffNumber} onChangeText={setStaffNumber}
                placeholder="e.g. #0042" placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Phone</Text>
              <TextInput
                style={s.fieldInput} value={phone} onChangeText={setPhone}
                placeholder="e.g. 0412 345 678" placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
              />
            </View>
            <View style={[s.fieldRow, { borderBottomWidth: 0 }]}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.mutedForeground} style={{ marginRight: 4 }} />
              <Text style={s.fieldLabel}>Sign-in PIN</Text>
              <TextInput
                style={s.fieldInput} value={pin} onChangeText={setPin}
                placeholder="e.g. 1234" placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric" secureTextEntry maxLength={10}
              />
            </View>
          </View>
          <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginHorizontal: 16, marginTop: -8, marginBottom: 14, lineHeight: 17 }}>
            The PIN lets this person sign in on the Roster screen. Use their phone number (last 4 digits) as a backup if PIN is not set. PINs are never shown in the app.
          </Text>

          {/* Role */}
          <View style={[s.card, { borderColor: colors.border }]}>
            <View style={[s.cardHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Feather name="award" size={14} color={colors.mutedForeground} />
              <Text style={[s.cardTitle, { color: colors.foreground }]}>Role</Text>
            </View>
            <View style={s.chipRow}>
              {ROLES.map((r) => {
                const rc = ROLE_COLORS[r];
                const selected = role === r;
                return (
                  <Pressable
                    key={r}
                    style={[s.chip, { backgroundColor: selected ? rc + "25" : "transparent", borderColor: selected ? rc : colors.border }]}
                    onPress={() => { setRole(r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  >
                    <Text style={[s.chipText, { color: selected ? rc : colors.mutedForeground }]}>{r}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Shift */}
          <View style={[s.card, { borderColor: "#3B82F660" }]}>
            <View style={[s.cardHeader, { backgroundColor: "#3B82F615", borderBottomColor: "#3B82F630" }]}>
              <Feather name="clock" size={14} color="#3B82F6" />
              <Text style={[s.cardTitle, { color: "#3B82F6" }]}>Shift Times</Text>
              <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>24-hr format (HH:MM)</Text>
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Shift start</Text>
              <TextInput
                style={s.fieldInput} value={shiftStart} onChangeText={setShiftStart}
                placeholder="08:00" placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={[s.fieldRow, { borderBottomWidth: 0 }]}>
              <Text style={s.fieldLabel}>Shift end</Text>
              <TextInput
                style={s.fieldInput} value={shiftEnd} onChangeText={setShiftEnd}
                placeholder="16:00" placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>

          {/* Section / Team */}
          <View style={[s.card, { borderColor: colors.border }]}>
            <View style={[s.cardHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Feather name="users" size={14} color={colors.mutedForeground} />
              <Text style={[s.cardTitle, { color: colors.foreground }]}>Kitchen Section</Text>
              <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Which team are they on?</Text>
            </View>
            <View style={s.chipRow}>
              {TEAMS.map((t) => {
                const tc = TEAM_COLORS[t];
                const selected = section === t;
                return (
                  <Pressable
                    key={t}
                    style={[s.chip, { backgroundColor: selected ? tc + "25" : "transparent", borderColor: selected ? tc : colors.border }]}
                    onPress={() => { setSection(t); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  >
                    <Text style={[s.chipText, { color: selected ? tc : colors.mutedForeground }]}>{t}</Text>
                  </Pressable>
                );
              })}
              <Pressable
                style={[s.chip, { backgroundColor: !section ? colors.mutedForeground + "25" : "transparent", borderColor: !section ? colors.mutedForeground : colors.border }]}
                onPress={() => { setSection(undefined); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Text style={[s.chipText, { color: colors.mutedForeground }]}>None</Text>
              </Pressable>
            </View>

            {/* Team lead toggle */}
            {section && (
              <View style={[s.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Pressable
                  style={[s.toggleTrack, { backgroundColor: isTeamLead ? "#22C55E" : colors.border }]}
                  onPress={() => { setIsTeamLead(!isTeamLead); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <View style={[s.toggleThumb, { alignSelf: isTeamLead ? "flex-end" : "flex-start" }]} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>Team leader for {section}</Text>
                  <Text style={s.toggleSub}>Will appear as the contact on the casual staff QR brief</Text>
                </View>
              </View>
            )}
          </View>

          {/* Access level override */}
          <View style={[s.card, { borderColor: colors.border, marginBottom: 6 }]}>
            <View style={[s.cardHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.mutedForeground} />
              <Text style={[s.cardTitle, { color: colors.foreground }]}>Access Level</Text>
              <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Optional override</Text>
            </View>
            <View style={s.accessRow}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 4 }}>
                Leave unset to use role default (e.g. Head Chef → Manager, Casual → Staff)
              </Text>
              {ACCESS_OVERRIDES.map((opt) => {
                const selected = accessOverride === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[s.accessChip, { backgroundColor: selected ? colors.primary + "15" : "transparent", borderColor: selected ? colors.primary : colors.border }]}
                    onPress={() => { setAccessOverride(selected ? undefined : opt.value); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  >
                    <Ionicons name={selected ? "shield-checkmark" : "shield-outline"} size={18} color={selected ? colors.primary : colors.mutedForeground} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: selected ? colors.primary : colors.foreground }}>{opt.label}</Text>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{opt.desc}</Text>
                    </View>
                    {selected && (
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.primary + "25", borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.primary }}>OVERRIDE</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={s.bottomPad} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
