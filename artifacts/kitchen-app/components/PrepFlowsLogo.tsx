import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
  Path,
} from "react-native-svg";

interface Props {
  size?: number;
}

/**
 * PrepFlows mark — fluid gradient "P" letterform.
 * Thick rounded stroke path on a deep dark square.
 * Glow simulated with layered semi-transparent wide strokes.
 */
export function PrepFlowsLogo({ size = 40 }: Props) {
  const P_PATH =
    "M 30 82 L 30 18 Q 30 8 42 8 L 57 8 Q 73 8 73 28 L 73 40 Q 73 58 57 58 L 30 58";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="pfBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0D1520" />
          <Stop offset="1" stopColor="#060A10" />
        </LinearGradient>
        <LinearGradient id="pfGrad" x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#60A5FA" />
          <Stop offset="0.45" stopColor="#22D3EE" />
          <Stop offset="1" stopColor="#A78BFA" />
        </LinearGradient>
        <RadialGradient id="pfGlow" cx="52%" cy="38%" r="48%">
          <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.32" />
          <Stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Background */}
      <Rect width="100" height="100" rx="22" fill="url(#pfBg)" />

      {/* Ambient radial glow */}
      <Rect width="100" height="100" rx="22" fill="url(#pfGlow)" />

      {/* Outer glow halo */}
      <Path
        d={P_PATH}
        stroke="#4FACFE"
        strokeWidth="30"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.06}
      />
      {/* Mid glow */}
      <Path
        d={P_PATH}
        stroke="#22D3EE"
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.12}
      />

      {/* Main P letterform */}
      <Path
        d={P_PATH}
        stroke="url(#pfGrad)"
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
