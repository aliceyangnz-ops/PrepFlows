import { useWindowDimensions } from "react-native";

export const SIDEBAR_WIDTH = 224;

export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= 768;
}
