import React from "react";
import Svg, { Rect } from "react-native-svg";

interface Props {
  size?: number;
}

/**
 * PrepFlows logo mark — 3 narrowing bars inside a rounded square.
 * Mirrors the web favicon mark at any native size.
 */
export function PrepFlowsLogo({ size = 38 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Rect width="40" height="40" rx="10" fill="#3B82F6" />
      <Rect x="9" y="11" width="22" height="4" rx="2" fill="white" />
      <Rect x="9" y="18" width="15" height="4" rx="2" fill="white" fillOpacity="0.72" />
      <Rect x="9" y="25" width="9" height="4" rx="2" fill="white" fillOpacity="0.4" />
    </Svg>
  );
}
