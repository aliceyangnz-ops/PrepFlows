import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
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

export default function PrepScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { functions, prepItems, togglePrepItem } = useKitchen();
  const [selectedFunctionId, setSelectedFunctionId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filteredItems = useMemo(() => {
    if (!selectedFunctionId) return prepItems;
    return prepItems.filter((p) => p.functionId === selectedFunctionId);
  }, [prepItems, selectedFunctionId]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filteredItems> = {};
    filteredItems.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [filteredItems]);

  const totalItems = filteredItems.length;
  const completedItems = filteredItems.filter((p) => p.completed).length;
  const percent = totalItems > 0 ? completedItems / totalItems : 0;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    progressArea: { paddingHorizontal: 20, marginBottom: 16 },
    progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    progressLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    progressCount: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground },
    progressBar: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: 5, borderRadius: 3 },
    filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 16 },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    categorySection: { marginBottom: 4 },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 8,
      gap: 8,
    },
    categoryDot: { width: 7, height: 7, borderRadius: 4 },
    categoryLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, textTransform: "uppercase", flex: 1 },
    categoryCount: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    itemRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    itemContent: { flex: 1 },
    dishName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
    quantity: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.primary, marginTop: 2 },
    note: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 3, lineHeight: 16 },
    functionTag: {
      marginTop: 4,
      alignSelf: "flex-start",
      backgroundColor: colors.secondary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    functionTagText: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  const categoryColors: Record<string, string> = {
    Proteins: colors.destructive,
    Sauces: "#F97316",
    Sides: "#22C55E",
    Pastry: "#A78BFA",
    Garnishes: "#14B8A6",
    Default: colors.mutedForeground,
  };

  function getCatColor(cat: string) {
    return categoryColors[cat] ?? categoryColors.Default;
  }

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Prep List</Text>
        </View>

        <View style={s.progressArea}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Overall progress</Text>
            <Text style={s.progressCount}>{completedItems} / {totalItems}</Text>
          </View>
          <View style={s.progressBar}>
            <View
              style={[
                s.progressFill,
                {
                  width: `${percent * 100}%`,
                  backgroundColor: percent === 1 ? colors.accent : colors.primary,
                },
              ]}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 8 }}>
          <Pressable
            style={[
              s.filterChip,
              {
                backgroundColor: !selectedFunctionId ? colors.primary : "transparent",
                borderColor: !selectedFunctionId ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedFunctionId(null)}
          >
            <Text style={[s.filterText, { color: !selectedFunctionId ? "#fff" : colors.mutedForeground }]}>All</Text>
          </Pressable>
          {functions.map((fn) => {
            const active = selectedFunctionId === fn.id;
            return (
              <Pressable
                key={fn.id}
                style={[
                  s.filterChip,
                  {
                    backgroundColor: active ? colors.primary : "transparent",
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedFunctionId(active ? null : fn.id)}
              >
                <Text style={[s.filterText, { color: active ? "#fff" : colors.mutedForeground }]} numberOfLines={1}>
                  {fn.room}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {Object.entries(grouped).map(([category, items]) => {
          const catColor = getCatColor(category);
          const catDone = items.filter((i) => i.completed).length;
          return (
            <View key={category} style={s.categorySection}>
              <View style={s.categoryHeader}>
                <View style={[s.categoryDot, { backgroundColor: catColor }]} />
                <Text style={s.categoryLabel}>{category}</Text>
                <Text style={s.categoryCount}>{catDone}/{items.length}</Text>
              </View>
              {items.map((item) => {
                const fn = functions.find((f) => f.id === item.functionId);
                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [s.itemRow, pressed && { backgroundColor: colors.secondary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      togglePrepItem(item.id);
                    }}
                  >
                    <View
                      style={[
                        s.checkbox,
                        {
                          backgroundColor: item.completed ? colors.accent : "transparent",
                          borderColor: item.completed ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      {item.completed && <Feather name="check" size={13} color="#fff" />}
                    </View>
                    <View style={s.itemContent}>
                      <Text style={[s.dishName, { color: item.completed ? colors.mutedForeground : colors.foreground, textDecorationLine: item.completed ? "line-through" : "none" }]}>
                        {item.dish}
                      </Text>
                      <Text style={s.quantity}>{item.quantity}</Text>
                      {item.note ? <Text style={s.note}>{item.note}</Text> : null}
                      {!selectedFunctionId && fn && (
                        <View style={s.functionTag}>
                          <Text style={s.functionTagText}>{fn.room}</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
