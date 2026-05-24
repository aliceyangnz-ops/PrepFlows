import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface LiquidGlassIconProps {
  children: React.ReactNode;
  active?: boolean;
  size?: number;
  shape?: "circle" | "pill";
  activeColor?: string;
}

/**
 * Wraps an icon in an iOS 26-style Liquid Glass bubble.
 *
 * Visual layers (bottom → top):
 *  1. Dark translucent glass body
 *  2. Active-colour tint overlay (when focused)
 *  3. Specular highlight — white gradient on the top half
 *  4. Inner border with brighter top edge
 *  5. The icon itself
 */
export function LiquidGlassIcon({
  children,
  active = false,
  size = 46,
  shape = "pill",
  activeColor = "#EAB308",
}: LiquidGlassIconProps) {
  const radius = shape === "circle" ? size / 2 : size * 0.38;
  const pillW = shape === "pill" ? size * 1.28 : size;
  const pillH = size;

  return (
    <View
      style={[
        styles.container,
        {
          width: pillW,
          height: pillH,
          borderRadius: radius,
        },
      ]}
    >
      {/* ① Glass body */}
      <LinearGradient
        colors={["rgba(30,34,42,0.72)", "rgba(18,21,27,0.82)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />

      {/* ② Active colour tint */}
      {active && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              backgroundColor: activeColor + "26",
            },
          ]}
        />
      )}

      {/* ③ Specular highlight — upper half bright streak */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.38)",
          "rgba(255,255,255,0.10)",
          "rgba(255,255,255,0.00)",
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, height: pillH * 0.52, top: 0 },
        ]}
      />

      {/* ④ Glass border — top edge is brightest (iOS specular) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: 0.75,
            borderColor: "rgba(255,255,255,0.18)",
            borderTopColor: "rgba(255,255,255,0.52)",
            borderBottomColor: "rgba(0,0,0,0.30)",
          },
        ]}
      />

      {/* ⑤ Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  content: {
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
