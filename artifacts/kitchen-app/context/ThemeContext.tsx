import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { THEMES, type ThemeName } from "@/constants/colors";

const THEME_KEY = "@kitchen_theme_v1";

type ThemeColors = typeof THEMES["navy"] & { radius: number };

interface ThemeCtx {
  themeName: ThemeName;
  setThemeName: (t: ThemeName) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>("navy");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored && stored in THEMES) {
        setThemeNameState(stored as ThemeName);
      }
    });
  }, []);

  function setThemeName(t: ThemeName) {
    setThemeNameState(t);
    AsyncStorage.setItem(THEME_KEY, t);
  }

  const colors: ThemeColors = { ...THEMES[themeName], radius: 10 };

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
