import React from "react";
import Svg, { Defs, LinearGradient, Stop, Path } from "react-native-svg";

interface Props {
  size?: number;
}

/**
 * PrepFlows "P" mark — clean stroke letterform with a blue-to-purple
 * linear gradient. Transparent background; floats on any surface.
 */
export function PrepFlowsLogo({ size = 40 }: Props) {
  // Smooth stroke-based P: stem + wide rounded bowl
  const P_PATH =
    "M 36 78 L 36 26 C 36 17 46 13 56 13 C 72 13 78 25 78 37 C 78 51 68 59 54 59 L 36 59";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Sky blue → royal blue → indigo → purple */}
        <LinearGradient id="pfGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#93C5FD" />
          <Stop offset="30%" stopColor="#4D7CFF" />
          <Stop offset="65%" stopColor="#818CF8" />
          <Stop offset="100%" stopColor="#A259FF" />
        </LinearGradient>
      </Defs>

      <Path
        d={P_PATH}
        stroke="url(#pfGrad)"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
