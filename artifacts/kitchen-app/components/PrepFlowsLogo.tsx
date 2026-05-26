import React from "react";
import { Image, StyleSheet } from "react-native";

interface Props {
  size?: number;
}

export function PrepFlowsLogo({ size = 40 }: Props) {
  return (
    <Image
      source={require("../assets/images/prepflows-logo.png")}
      style={[styles.img, { width: size, height: size, borderRadius: size * 0.22 }]}
      resizeMode="cover"
      accessibilityLabel="PrepFlows logo"
    />
  );
}

const styles = StyleSheet.create({
  img: {
    overflow: "hidden",
  },
});
