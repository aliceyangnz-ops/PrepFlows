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
 * PrepFlows mark — fluid organic blob with liquid-glass shading.
 * Yellow-gold at the specular highlight, flowing to deep forest green
 * at the shadowed edges. White "P" letterform on top.
 */
export function PrepFlowsLogo({ size = 40 }: Props) {
  // Organic, slightly asymmetric blob — tilted upper-right for dynamism
  const BLOB =
    "M 57 13 C 78 11, 89 29, 87 52 C 85 73, 69 88, 49 86 C 29 84, 13 67, 14 46 C 15 26, 36 15, 57 13 Z";
  // Specular crescent — bright liquid-glass reflection at top-left
  const SPEC =
    "M 32 26 C 39 17, 59 16, 66 25 C 71 32, 57 20, 45 21 C 37 21, 30 31, 32 26 Z";
  // Secondary micro-highlight inside the specular zone
  const SPEC2 =
    "M 36 33 C 41 25, 51 24, 55 29 C 47 23, 37 29, 36 33 Z";
  // Bold rounded "P" letterform — centered on blob
  const P_PATH =
    "M 37 72 L 37 28 Q 37 22 43 22 L 55 22 Q 67 22 67 35 L 67 44 Q 67 57 55 57 L 37 57";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Very dark background */}
        <LinearGradient id="pfBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0B0E14" />
          <Stop offset="1" stopColor="#060809" />
        </LinearGradient>

        {/* Blob: near-white highlight → brand yellow → amber → deep forest green */}
        <RadialGradient id="pfBlob" cx="33%" cy="27%" r="75%">
          <Stop offset="0%" stopColor="#FEFCE8" />
          <Stop offset="12%" stopColor="#FDE047" />
          <Stop offset="36%" stopColor="#EAB308" />
          <Stop offset="62%" stopColor="#CA8A04" />
          <Stop offset="82%" stopColor="#14532D" />
          <Stop offset="100%" stopColor="#052E16" />
        </RadialGradient>

        {/* Ambient glow — yellow halo behind blob */}
        <RadialGradient id="pfGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#EAB308" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Background */}
      <Rect width="100" height="100" rx="22" fill="url(#pfBg)" />

      {/* Ambient yellow glow */}
      <Rect width="100" height="100" rx="22" fill="url(#pfGlow)" />

      {/* Main fluid blob */}
      <Path d={BLOB} fill="url(#pfBlob)" />

      {/* Specular crescent — primary liquid-glass reflection */}
      <Path d={SPEC} fill="white" opacity={0.48} />

      {/* Micro inner highlight — brightest point */}
      <Path d={SPEC2} fill="white" opacity={0.65} />

      {/* "P" letterform — clean white, sits on the blob */}
      <Path
        d={P_PATH}
        stroke="white"
        strokeWidth="8.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
