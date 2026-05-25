import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme, useWindowDimensions } from "react-native";

import { LiquidGlassIcon } from "@/components/LiquidGlassIcon";
import { TabletSidebar } from "@/components/TabletSidebar";
import { useColors } from "@/hooks/useColors";
import { SIDEBAR_WIDTH } from "@/hooks/useIsTablet";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "calendar", selected: "calendar" }} />
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
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: isTablet
            ? { display: "none" }
            : {
                position: "absolute",
                backgroundColor: isIOS ? "transparent" : colors.card,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                elevation: 0,
                ...(isWeb ? { height: 84 } : {}),
              },
          tabBarBackground: () =>
            isTablet ? null : isIOS ? (
              <BlurView
                intensity={80}
                tint={isDark ? "dark" : "dark"}
                style={StyleSheet.absoluteFill}
              />
            ) : isWeb ? (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
            ) : null,
          sceneStyle: isTablet ? { marginLeft: SIDEBAR_WIDTH } : undefined,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ color, focused }) => (
              <LiquidGlassIcon active={focused} size={38} shape="pill">
                {isIOS
                  ? <SymbolView name="calendar" tintColor={focused ? colors.primary : color} size={20} />
                  : <Feather name="calendar" size={19} color={focused ? colors.primary : color} />}
              </LiquidGlassIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="functions"
          options={{
            title: "Functions",
            tabBarIcon: ({ color, focused }) => (
              <LiquidGlassIcon active={focused} size={38} shape="pill">
                {isIOS
                  ? <SymbolView name="fork.knife" tintColor={focused ? colors.primary : color} size={20} />
                  : <MaterialCommunityIcons name="silverware-fork-knife" size={19} color={focused ? colors.primary : color} />}
              </LiquidGlassIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="prep"
          options={{
            title: "Prep",
            tabBarIcon: ({ color, focused }) => (
              <LiquidGlassIcon active={focused} size={38} shape="pill">
                {isIOS
                  ? <SymbolView name="checklist" tintColor={focused ? colors.primary : color} size={20} />
                  : <Feather name="check-square" size={19} color={focused ? colors.primary : color} />}
              </LiquidGlassIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="roster"
          options={{
            title: "Roster",
            tabBarIcon: ({ color, focused }) => (
              <LiquidGlassIcon active={focused} size={38} shape="pill">
                {isIOS
                  ? <SymbolView name="person.3" tintColor={focused ? colors.primary : color} size={20} />
                  : <Ionicons name="people-outline" size={20} color={focused ? colors.primary : color} />}
              </LiquidGlassIcon>
            ),
          }}
        />
      </Tabs>
      {isTablet && <TabletSidebar />}
    </View>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
