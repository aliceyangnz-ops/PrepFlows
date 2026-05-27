import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, Text, View, ViewStyle } from "react-native";

export const BRAND_GRAD = ["#3B82F6", "#06B6D4", "#818CF8"] as const;
export const BRAND_GRAD_H = ["#3B82F6", "#06B6D4"] as const;

export function GradientProgressBar({
  percent,
  height = 6,
  trackColor = "rgba(255,255,255,0.08)",
  doneColor,
  style,
}: {
  percent: number;
  height?: number;
  trackColor?: string;
  doneColor?: string;
  style?: ViewStyle;
}) {
  const pct = Math.max(0, Math.min(1, percent));
  return (
    <View
      style={[
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {pct > 0 &&
        (doneColor && pct >= 1 ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: height / 2,
              backgroundColor: doneColor,
            }}
          />
        ) : (
          <LinearGradient
            colors={BRAND_GRAD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: `${Math.round(pct * 100)}%`,
              height: "100%",
              borderRadius: height / 2,
            }}
          />
        ))}
    </View>
  );
}

export function GradientAccentBar({ style }: { style?: ViewStyle }) {
  return (
    <LinearGradient
      colors={BRAND_GRAD}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

export function GradientButton({
  label,
  onPress,
  icon,
  style,
  textStyle,
  disabled = false,
  radius = 12,
  paddingVertical = 14,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: object;
  disabled?: boolean;
  radius?: number;
  paddingVertical?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: pressed || disabled ? 0.65 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={BRAND_GRAD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: radius,
          paddingVertical,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {icon}
        <Text
          style={[
            {
              fontSize: 15,
              fontFamily: "Inter_700Bold",
              color: "#fff",
              letterSpacing: -0.3,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export function GradientDivider({ style }: { style?: ViewStyle }) {
  return (
    <LinearGradient
      colors={[
        "transparent",
        "rgba(59,130,246,0.5)",
        "rgba(6,182,212,0.4)",
        "transparent",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[{ height: 1 }, style]}
    />
  );
}

export function GradientHeaderDecor({ topPad = 0 }: { topPad?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: topPad + 140,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={[
          "rgba(59,130,246,0.13)",
          "rgba(6,182,212,0.05)",
          "transparent",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: "-30%",
          right: "-30%",
          height: "100%",
        }}
      />
    </View>
  );
}
