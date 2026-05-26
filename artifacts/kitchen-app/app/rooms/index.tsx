import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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
import {
  KitchenRoom,
  RoomFloor,
  RoomStyle,
  getAccessLevel,
  useKitchen,
} from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";

// ── Constants ──────────────────────────────────────────────────────────────

const FLOORS: RoomFloor[] = [
  "Ground Floor", "Level 1", "Level 2", "Level 3", "Level 4", "Rooftop", "Basement", "Other",
];

const STYLES: RoomStyle[] = [
  "Ballroom", "Boardroom", "Terrace", "Courtyard", "Private Dining",
  "Suite", "Theatre", "Classroom", "Cocktail", "Other",
];

const COMMON_FEATURES = [
  "AV System", "Stage", "Dance Floor", "Bar", "Dedicated Bar", "Two Dedicated Bars", "Bar Cart",
  "Natural Light", "City View", "River Views", "Garden Views", "Ocean View",
  "Climate Control", "Heating", "Heating Lamps", "Outdoor",
  "Retractable Awning", "String Lights",
  "Video Conferencing", "Whiteboard", "Projector",
  "Loading Dock", "Chandeliers",
];

function getStyleIcon(style: RoomStyle): string {
  switch (style) {
    case "Ballroom":       return "star";
    case "Boardroom":      return "briefcase";
    case "Terrace":        return "sunny";
    case "Courtyard":      return "leaf";
    case "Private Dining": return "restaurant";
    case "Suite":          return "bed";
    case "Theatre":        return "film";
    case "Classroom":      return "school";
    case "Cocktail":       return "wine";
    default:               return "business";
  }
}

function getStyleColor(style: RoomStyle): string {
  switch (style) {
    case "Ballroom":       return "#EAB308";
    case "Boardroom":      return "#3B82F6";
    case "Terrace":        return "#22C55E";
    case "Courtyard":      return "#84CC16";
    case "Private Dining": return "#F97316";
    case "Suite":          return "#8B5CF6";
    case "Theatre":        return "#EC4899";
    case "Classroom":      return "#14B8A6";
    case "Cocktail":       return "#F59E0B";
    default:               return "#94A3B8";
  }
}

// ── Empty form ─────────────────────────────────────────────────────────────

interface RoomForm {
  name: string;
  floor: RoomFloor;
  style: RoomStyle;
  capacity: string;
  banquetCapacity: string;
  cocktailCapacity: string;
  theatreCapacity: string;
  area: string;
  features: string[];
  notes: string;
  isActive: boolean;
}

const EMPTY_FORM: RoomForm = {
  name: "", floor: "Ground Floor", style: "Ballroom",
  capacity: "", banquetCapacity: "", cocktailCapacity: "", theatreCapacity: "",
  area: "", features: [], notes: "", isActive: true,
};

function roomToForm(room: KitchenRoom): RoomForm {
  return {
    name: room.name,
    floor: room.floor,
    style: room.style,
    capacity: String(room.capacity),
    banquetCapacity: room.banquetCapacity ? String(room.banquetCapacity) : "",
    cocktailCapacity: room.cocktailCapacity ? String(room.cocktailCapacity) : "",
    theatreCapacity: room.theatreCapacity ? String(room.theatreCapacity) : "",
    area: room.area ? String(room.area) : "",
    features: [...room.features],
    notes: room.notes ?? "",
    isActive: room.isActive,
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RoomsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const { rooms, addRoom, updateRoom, removeRoom, currentStaffId, staff } = useKitchen();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;

  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const isManager = currentMember ? getAccessLevel(currentMember) === "manager" : false;

  const [editingId, setEditingId]   = useState<string | null>(null);
  const [addingNew, setAddingNew]   = useState(false);
  const [form, setForm]             = useState<RoomForm>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter((r) =>
    !searchQuery.trim() ||
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Form actions ──────────────────────────────────────────────────────────

  function beginAdd() {
    setForm(EMPTY_FORM);
    setAddingNew(true);
    setEditingId(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function beginEdit(room: KitchenRoom) {
    setForm(roomToForm(room));
    setEditingId(room.id);
    setAddingNew(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function cancelForm() {
    setAddingNew(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleSave() {
    if (!form.name.trim()) { Alert.alert("Missing room name", "Please enter a name for this room."); return; }
    const cap = parseInt(form.capacity, 10);
    if (isNaN(cap) || cap < 1) { Alert.alert("Invalid capacity", "Please enter a valid maximum capacity."); return; }

    const roomData: Omit<KitchenRoom, "id"> = {
      name: form.name.trim(),
      floor: form.floor,
      style: form.style,
      capacity: cap,
      banquetCapacity: form.banquetCapacity ? parseInt(form.banquetCapacity, 10) || undefined : undefined,
      cocktailCapacity: form.cocktailCapacity ? parseInt(form.cocktailCapacity, 10) || undefined : undefined,
      theatreCapacity: form.theatreCapacity ? parseInt(form.theatreCapacity, 10) || undefined : undefined,
      area: form.area ? parseFloat(form.area) || undefined : undefined,
      features: form.features,
      notes: form.notes.trim() || undefined,
      isActive: form.isActive,
    };

    if (addingNew) {
      addRoom({ id: `room_${Date.now()}`, ...roomData });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Room added", `${form.name} has been added to your venue.`);
    } else if (editingId) {
      updateRoom(editingId, roomData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    cancelForm();
  }

  function handleDelete(room: KitchenRoom) {
    Alert.alert(
      "Remove Room",
      `Remove ${room.name} from your venue? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeRoom(room.id);
            if (editingId === room.id) cancelForm();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  }

  function toggleFeature(feature: string) {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feature)
        ? f.features.filter((x) => x !== feature)
        : [...f.features, feature],
    }));
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const s = StyleSheet.create({
    root:         { flex: 1, backgroundColor: colors.background },
    toolbar:      { paddingTop: topPad + 10, paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
    toolbarTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    addBtn:       { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.accent },
    addBtnText:   { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

    searchWrap:   { marginHorizontal: 16, marginTop: 14, marginBottom: 6, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
    searchInput:  { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, paddingVertical: 11 },

    summaryRow:   { flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 10, marginBottom: 4 },
    summaryCard:  { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" },
    summaryNum:   { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.primary },
    summaryLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 1 },

    emptyCard:    { margin: 20, padding: 32, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center", gap: 10 },
    emptyTitle:   { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    emptySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 20 },

    roomCard:     { marginHorizontal: 16, marginBottom: 10, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: "hidden" },
    roomCardInactive: { opacity: 0.55 },
    roomHeader:   { padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
    styleIcon:    { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    roomName:     { flex: 1, fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    roomFloor:    { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    inactiveBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.secondary },
    inactiveBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground },

    capacityRow:  { flexDirection: "row", paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
    capacityBubble: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
    capacityNum:  { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground },
    capacityLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 1 },

    expandBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.border },
    expandLabel:  { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },

    featureTags:  { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 14, paddingBottom: 10, paddingTop: 4 },
    featureTag:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.primary + "20", borderWidth: 1, borderColor: colors.primary + "40" },
    featureTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.primary },

    notesCard:    { marginHorizontal: 14, marginBottom: 10, padding: 10, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
    notesText:    { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 18 },

    actionRow:    { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingBottom: 12, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border },
    editBtn:      { flex: 1, paddingVertical: 9, borderRadius: 9, backgroundColor: colors.primary, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
    editBtnText:  { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
    deleteBtn:    { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, backgroundColor: "#EF444415", borderWidth: 1, borderColor: "#EF444430", alignItems: "center" },

    // ── Form sheet ──────────────────────────────────────────────────────────
    formOverlay:  { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#00000080", zIndex: 10 },
    formSheet:    { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 11, maxHeight: "90%" },
    formHandle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginTop: 10, marginBottom: 6 },
    formHeader:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    formTitle:    { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    formCancelBtn: { paddingHorizontal: 10, paddingVertical: 8 },
    formCancelTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    formSaveBtn:  { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.accent },
    formSaveTxt:  { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

    formSection:  { marginHorizontal: 16, marginTop: 16, marginBottom: 4, fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1 },
    formCard:     { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, overflow: "hidden" },
    formRow:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, minHeight: 50, borderBottomWidth: 1, borderBottomColor: colors.border },
    formLabel:    { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, width: 100 },
    formInput:    { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, paddingVertical: 10 },
    formInputFill: { color: colors.primary },

    chipGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 7, padding: 12 },
    chip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9, borderWidth: 1.5 },
    chipText:     { fontSize: 12, fontFamily: "Inter_700Bold" },

    toggleRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
    toggleLabel:  { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    toggleBtn:    { width: 48, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    toggleKnob:   { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff" },

    notesInput:   { marginHorizontal: 16, marginTop: 0, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.background, padding: 12, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 20, minHeight: 80, textAlignVertical: "top" },

    bottomPad:    { height: Platform.OS === "web" ? 60 : insets.bottom + 60 },
  });

  // ── Render helpers ─────────────────────────────────────────────────────────

  const activeRooms = rooms.filter((r) => r.isActive).length;
  const totalCapacity = rooms.filter((r) => r.isActive).reduce((sum, r) => sum + r.capacity, 0);

  function renderRoomCard(room: KitchenRoom) {
    const color   = getStyleColor(room.style);
    const icon    = getStyleIcon(room.style);
    const isOpen  = expandedId === room.id;

    return (
      <View key={room.id} style={[s.roomCard, !room.isActive && s.roomCardInactive]}>
        <Pressable style={s.roomHeader} onPress={() => setExpandedId(isOpen ? null : room.id)}>
          <View style={[s.styleIcon, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.roomName}>{room.name}</Text>
            <Text style={s.roomFloor}>{room.floor} · {room.style}</Text>
          </View>
          {!room.isActive && (
            <View style={s.inactiveBadge}><Text style={s.inactiveBadgeText}>INACTIVE</Text></View>
          )}
          <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
        </Pressable>

        {/* Capacity bubbles - always visible */}
        <View style={s.capacityRow}>
          <View style={s.capacityBubble}>
            <Text style={s.capacityNum}>{room.capacity}</Text>
            <Text style={s.capacityLabel}>MAX</Text>
          </View>
          {room.banquetCapacity !== undefined && (
            <View style={s.capacityBubble}>
              <Text style={s.capacityNum}>{room.banquetCapacity}</Text>
              <Text style={s.capacityLabel}>BANQUET</Text>
            </View>
          )}
          {room.cocktailCapacity !== undefined && (
            <View style={s.capacityBubble}>
              <Text style={s.capacityNum}>{room.cocktailCapacity}</Text>
              <Text style={s.capacityLabel}>COCKTAIL</Text>
            </View>
          )}
          {room.theatreCapacity !== undefined && (
            <View style={s.capacityBubble}>
              <Text style={s.capacityNum}>{room.theatreCapacity}</Text>
              <Text style={s.capacityLabel}>THEATRE</Text>
            </View>
          )}
          {room.area !== undefined && (
            <View style={s.capacityBubble}>
              <Text style={s.capacityNum}>{room.area}m²</Text>
              <Text style={s.capacityLabel}>AREA</Text>
            </View>
          )}
        </View>

        {/* Expanded details */}
        {isOpen && (
          <>
            {room.features.length > 0 && (
              <View style={s.featureTags}>
                {room.features.map((f) => (
                  <View key={f} style={s.featureTag}><Text style={s.featureTagText}>{f}</Text></View>
                ))}
              </View>
            )}
            {room.notes && (
              <View style={s.notesCard}>
                <Text style={s.notesText}>{room.notes}</Text>
              </View>
            )}
          </>
        )}

        {/* Actions (manager only) */}
        {isManager && (
          <View style={s.actionRow}>
            <Pressable style={s.editBtn} onPress={() => { beginEdit(room); }}>
              <Feather name="edit-3" size={14} color="#fff" />
              <Text style={s.editBtnText}>Edit Room</Text>
            </Pressable>
            <Pressable style={s.deleteBtn} onPress={() => handleDelete(room)}>
              <Feather name="trash-2" size={16} color="#EF4444" />
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  function renderForm() {
    const isEditing = editingId !== null;
    return (
      <>
        <Pressable style={s.formOverlay} onPress={cancelForm} />
        <KeyboardAvoidingView
          style={s.formSheet}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Handle */}
          <View style={s.formHandle} />

          {/* Header */}
          <View style={s.formHeader}>
            <Pressable style={s.formCancelBtn} onPress={cancelForm}>
              <Text style={s.formCancelTxt}>Cancel</Text>
            </Pressable>
            <Text style={[s.formTitle, { textAlign: "center" }]}>
              {isEditing ? "Edit Room" : "New Room"}
            </Text>
            <Pressable style={s.formSaveBtn} onPress={handleSave}>
              <Text style={s.formSaveTxt}>Save</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Basic details */}
            <Text style={s.formSection}>Room Details</Text>
            <View style={s.formCard}>
              <View style={s.formRow}>
                <Text style={s.formLabel}>Room name</Text>
                <TextInput
                  style={[s.formInput, form.name && s.formInputFill]}
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="e.g. Ballroom A"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={[s.formRow, { borderBottomWidth: 0 }]}>
                <Text style={s.formLabel}>Area (m²)</Text>
                <TextInput
                  style={[s.formInput, form.area && s.formInputFill]}
                  value={form.area}
                  onChangeText={(v) => setForm((f) => ({ ...f, area: v }))}
                  placeholder="e.g. 480"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Floor */}
            <Text style={s.formSection}>Floor / Level</Text>
            <View style={[s.formCard, { overflow: "visible" }]}>
              <View style={s.chipGrid}>
                {FLOORS.map((floor) => {
                  const selected = form.floor === floor;
                  return (
                    <Pressable
                      key={floor}
                      style={[s.chip, { backgroundColor: selected ? colors.primary + "20" : "transparent", borderColor: selected ? colors.primary : colors.border }]}
                      onPress={() => setForm((f) => ({ ...f, floor }))}
                    >
                      <Text style={[s.chipText, { color: selected ? colors.primary : colors.mutedForeground }]}>{floor}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Style */}
            <Text style={s.formSection}>Room Style</Text>
            <View style={[s.formCard, { overflow: "visible" }]}>
              <View style={s.chipGrid}>
                {STYLES.map((style) => {
                  const selected = form.style === style;
                  const sc = getStyleColor(style);
                  return (
                    <Pressable
                      key={style}
                      style={[s.chip, { backgroundColor: selected ? sc + "25" : "transparent", borderColor: selected ? sc : colors.border }]}
                      onPress={() => setForm((f) => ({ ...f, style }))}
                    >
                      <Text style={[s.chipText, { color: selected ? sc : colors.mutedForeground }]}>{style}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Capacities */}
            <Text style={s.formSection}>Capacities</Text>
            <View style={s.formCard}>
              {([
                { key: "capacity",        label: "Max capacity", required: true  },
                { key: "banquetCapacity", label: "Banquet",      required: false },
                { key: "cocktailCapacity",label: "Cocktail",     required: false },
                { key: "theatreCapacity", label: "Theatre",      required: false },
              ] as const).map(({ key, label }, idx, arr) => {
                const val = form[key];
                return (
                  <View key={key} style={[s.formRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={s.formLabel}>{label}</Text>
                    <TextInput
                      style={[s.formInput, val && s.formInputFill]}
                      value={val}
                      onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                      placeholder="—"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                    />
                  </View>
                );
              })}
            </View>

            {/* Features */}
            <Text style={s.formSection}>Features</Text>
            <View style={[s.formCard, { overflow: "visible" }]}>
              <View style={s.chipGrid}>
                {COMMON_FEATURES.map((feature) => {
                  const selected = form.features.includes(feature);
                  return (
                    <Pressable
                      key={feature}
                      style={[s.chip, { backgroundColor: selected ? colors.accent + "25" : "transparent", borderColor: selected ? colors.accent : colors.border }]}
                      onPress={() => toggleFeature(feature)}
                    >
                      {selected && <Feather name="check" size={11} color={colors.accent} style={{ marginRight: 3 }} />}
                      <Text style={[s.chipText, { color: selected ? colors.accent : colors.mutedForeground }]}>{feature}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Active toggle */}
            <Text style={s.formSection}>Status</Text>
            <View style={s.formCard}>
              <View style={s.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>Room is active</Text>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
                    Inactive rooms are hidden from function booking
                  </Text>
                </View>
                <Pressable
                  style={[s.toggleBtn, { backgroundColor: form.isActive ? colors.accent : colors.secondary, justifyContent: form.isActive ? "flex-end" : "flex-start", paddingHorizontal: 3 }]}
                  onPress={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                >
                  <View style={s.toggleKnob} />
                </Pressable>
              </View>
            </View>

            {/* Notes */}
            <Text style={s.formSection}>Notes <Text style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>— catering access, setup rules, etc.</Text></Text>
            <TextInput
              style={s.notesInput}
              value={form.notes}
              onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
              placeholder="e.g. Loading dock access via service corridor. No trolleys in main lobby during event hours."
              placeholderTextColor={colors.mutedForeground}
              multiline
              scrollEnabled={false}
            />

            <View style={s.bottomPad} />
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={s.root}>
      {/* Toolbar */}
      <View style={s.toolbar}>
        <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={s.toolbarTitle}>Function Rooms</Text>
        {isManager && (
          <Pressable style={({ pressed }) => [s.addBtn, pressed && { opacity: 0.8 }]} onPress={beginAdd}>
            <Feather name="plus" size={15} color="#fff" />
            <Text style={s.addBtnText}>Add Room</Text>
          </Pressable>
        )}
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={s.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search rooms…"
          placeholderTextColor={colors.mutedForeground}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryNum}>{rooms.length}</Text>
          <Text style={s.summaryLabel}>Total Rooms</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryNum}>{activeRooms}</Text>
          <Text style={s.summaryLabel}>Active</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryNum, { fontSize: 16 }]}>{totalCapacity.toLocaleString()}</Text>
          <Text style={s.summaryLabel}>Total Capacity</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
        {filteredRooms.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="business-outline" size={40} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>
              {rooms.length === 0 ? "No rooms yet" : "No results"}
            </Text>
            <Text style={s.emptySubtitle}>
              {rooms.length === 0
                ? "Add your venue's function rooms so staff can see capacity, features, and setup notes."
                : "Try a different search term."}
            </Text>
            {rooms.length === 0 && isManager && (
              <Pressable style={[s.addBtn, { marginTop: 8 }]} onPress={beginAdd}>
                <Feather name="plus" size={14} color="#fff" />
                <Text style={s.addBtnText}>Add First Room</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredRooms.map(renderRoomCard)
        )}
        <View style={{ height: Platform.OS === "web" ? 80 : insets.bottom + 80 }} />
      </ScrollView>

      {/* Add/Edit form sheet */}
      {(addingNew || editingId !== null) && renderForm()}
    </View>
  );
}
