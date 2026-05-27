export type ThemeName = "navy" | "midnight" | "violet" | "ocean" | "ember";

interface ThemeColors {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
}

const COMMON: Pick<
  ThemeColors,
  | "text"
  | "foreground"
  | "cardForeground"
  | "primaryForeground"
  | "secondaryForeground"
  | "accentForeground"
  | "destructiveForeground"
  | "destructive"
  | "warning"
  | "warningForeground"
  | "infoForeground"
> = {
  text: "#0a0a0a",
  foreground: "#F0F2F5",
  cardForeground: "#F0F2F5",
  primaryForeground: "#FFFFFF",
  secondaryForeground: "#A0AAB8",
  accentForeground: "#FFFFFF",
  destructiveForeground: "#FFFFFF",
  destructive: "#EF4444",
  warning: "#F59E0B",
  warningForeground: "#FFFFFF",
  infoForeground: "#FFFFFF",
};

export const THEMES: Record<ThemeName, ThemeColors> = {
  /** Deep navy — reference brand palette */
  navy: {
    ...COMMON,
    background: "#050C1A",
    card: "#0A1528",
    primary: "#4D7CFF",
    tint: "#4D7CFF",
    secondary: "#0F1E35",
    muted: "#0F1E35",
    border: "#162140",
    input: "#162140",
    accent: "#00E0FF",
    info: "#4D7CFF",
    mutedForeground: "#5A7AA8",
  },
  /** Classic dark */
  midnight: {
    ...COMMON,
    background: "#0D1117",
    card: "#161B22",
    primary: "#3B82F6",
    tint: "#3B82F6",
    secondary: "#1E2435",
    muted: "#1E2435",
    border: "#21262D",
    input: "#21262D",
    accent: "#22C55E",
    info: "#3B82F6",
    mutedForeground: "#6B7A94",
  },
  /** Deep violet / purple */
  violet: {
    ...COMMON,
    background: "#0A0714",
    card: "#110E1E",
    primary: "#A259FF",
    tint: "#A259FF",
    secondary: "#1A1428",
    muted: "#1A1428",
    border: "#231A38",
    input: "#231A38",
    accent: "#FF5ECB",
    info: "#A259FF",
    mutedForeground: "#6A5A8A",
  },
  /** Deep ocean / teal */
  ocean: {
    ...COMMON,
    background: "#030F18",
    card: "#071A26",
    primary: "#00E0FF",
    tint: "#00E0FF",
    secondary: "#0A2133",
    muted: "#0A2133",
    border: "#0F2840",
    input: "#0F2840",
    accent: "#00F5A0",
    info: "#00E0FF",
    mutedForeground: "#3A7A8A",
  },
  /** Ember / warm dark */
  ember: {
    ...COMMON,
    background: "#120900",
    card: "#1E1200",
    primary: "#FF9A3C",
    tint: "#FF9A3C",
    secondary: "#261800",
    muted: "#261800",
    border: "#2E1E05",
    input: "#2E1E05",
    accent: "#FFC107",
    info: "#FF9A3C",
    mutedForeground: "#7A6040",
  },
};

const colors = {
  light: THEMES.navy,
  radius: 10,
};

export default colors;
