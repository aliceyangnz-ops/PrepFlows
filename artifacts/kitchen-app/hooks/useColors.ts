import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the active theme's design tokens.
 * Theme is user-selected and persisted to AsyncStorage via ThemeContext.
 */
export function useColors() {
  return useTheme().colors;
}
