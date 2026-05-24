import React from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

interface Props {
  size?: number;
}

/**
 * PrepFlows gradient flow mark for React Native.
 * Mirrors the web logo: dark square + 3 narrowing gradient bars (blue→cyan→indigo).
 * Filter glow is omitted (react-native-svg limitation); gradient alone reads premium.
 */
export function PrepFlowsLogo({ size = 38 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="pfGrad" x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0"    stopColor="#3B82F6" />
          <Stop offset="0.55" stopColor="#06B6D4" />
          <Stop offset="1"    stopColor="#818CF8" />
        </LinearGradient>
      </Defs>

      {/* Background */}
      <Rect width="40" height="40" rx="10" fill="#0A0A0A" />

      {/* Subtle ambient glow layer */}
      <Rect x="7" y="9" width="24" height="22" rx="4" fill="url(#pfGrad)" opacity="0.08" />

      {/* Flow bars */}
      <Rect x="8" y="11"   width="22" height="3.5" rx="1.75" fill="url(#pfGrad)" />
      <Rect x="8" y="18.5" width="15" height="3.5" rx="1.75" fill="url(#pfGrad)" opacity="0.78" />
      <Rect x="8" y="26"   width="9"  height="3.5" rx="1.75" fill="url(#pfGrad)" opacity="0.48" />
    </Svg>
  );
}
