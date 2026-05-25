import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accentColor?: string;
}

/**
 * Liquid Glass card container — mirrors the tab-bar LiquidGlassIcon treatment
 * at card scale.
 *
 * Layers (bottom → top):
 *  1. Dark glass body gradient
 *  2. Accent colour tint (when accentColor is supplied)
 *  3. Specular highlight — bright streak on the upper ~40%
 *  4. Inner border — top edge brightest (iOS specular look)
 *  5. Children
 */
export function GlassCard({ children, style, accentColor }: GlassCardProps) {
  const flat = StyleSheet.flatten(style) as Record<string, unknown> | undefined;
  const radius = (flat?.borderRadius as number | undefined) ?? 12;

  return (
    <View style={[styles.base, style]}>
      {/* ① Glass body */}
      <LinearGradient
        colors={["rgba(32,40,54,0.90)", "rgba(18,22,32,0.95)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />

      {/* ② Accent colour tint */}
      {accentColor && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, backgroundColor: accentColor + "18" },
          ]}
        />
      )}

      {/* ③ Specular highlight — bright streak on upper ~40% */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.15)",
          "rgba(255,255,255,0.05)",
          "rgba(255,255,255,0.00)",
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius, bottom: "60%" }]}
      />

      {/* ④ Glass border — top edge is brightest (iOS specular) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: 1,
            borderColor: accentColor
              ? accentColor + "35"
              : "rgba(255,255,255,0.10)",
            borderTopColor: accentColor
              ? accentColor + "65"
              : "rgba(255,255,255,0.26)",
            borderBottomColor: "rgba(0,0,0,0.28)",
          },
        ]}
      />

      {/* ⑤ Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});
