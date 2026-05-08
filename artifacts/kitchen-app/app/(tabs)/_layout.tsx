import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "calendar", selected: "calendar.fill" }} />
        <Label>Today</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="functions">
        <Icon sf={{ default: "fork.knife", selected: "fork.knife" }} />
        <Label>Functions</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="prep">
        <Icon sf={{ default: "checklist", selected: "checklist" }} />
        <Label>Prep</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="roster">
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
        <Label>Roster</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "dark"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="calendar" tintColor={color} size={22} />
            ) : (
              <Feather name="calendar" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="functions"
        options={{
          title: "Functions",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="fork.knife" tintColor={color} size={22} />
            ) : (
              <MaterialCommunityIcons name="silverware-fork-knife" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="prep"
        options={{
          title: "Prep",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="checklist" tintColor={color} size={22} />
            ) : (
              <Feather name="check-square" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="roster"
        options={{
          title: "Roster",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.3" tintColor={color} size={22} />
            ) : (
              <Ionicons name="people-outline" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
