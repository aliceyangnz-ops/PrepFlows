import React from "react";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Path,
} from "react-native-svg";

interface Props {
  size?: number;
}

/**
 * PrepFlows mark — fluid organic blob with liquid-glass shading.
 * Transparent background so it sits flush with whatever page colour
 * it's placed on. Yellow-gold specular highlight → deep forest green.
 */
export function PrepFlowsLogo({ size = 40 }: Props) {
  const BLOB =
    "M 57 13 C 78 11, 89 29, 87 52 C 85 73, 69 88, 49 86 C 29 84, 13 67, 14 46 C 15 26, 36 15, 57 13 Z";
  const SPEC =
    "M 32 26 C 39 17, 59 16, 66 25 C 71 32, 57 20, 45 21 C 37 21, 30 31, 32 26 Z";
  const SPEC2 =
    "M 36 33 C 41 25, 51 24, 55 29 C 47 23, 37 29, 36 33 Z";
  const P_PATH =
    "M 37 72 L 37 28 Q 37 22 43 22 L 55 22 Q 67 22 67 35 L 67 44 Q 67 57 55 57 L 37 57";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="pfBlob" cx="33%" cy="27%" r="75%">
          <Stop offset="0%" stopColor="#FEFCE8" />
          <Stop offset="12%" stopColor="#FDE047" />
          <Stop offset="36%" stopColor="#EAB308" />
          <Stop offset="62%" stopColor="#CA8A04" />
          <Stop offset="82%" stopColor="#14532D" />
          <Stop offset="100%" stopColor="#052E16" />
        </RadialGradient>
      </Defs>

      {/* Main fluid blob — sits directly on the page background */}
      <Path d={BLOB} fill="url(#pfBlob)" />

      {/* Specular crescent — liquid-glass reflection */}
      <Path d={SPEC} fill="white" opacity={0.48} />

      {/* Micro inner highlight */}
      <Path d={SPEC2} fill="white" opacity={0.65} />

      {/* "P" letterform */}
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
