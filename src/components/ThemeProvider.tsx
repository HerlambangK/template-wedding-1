"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { getTheme, type ThemeColors } from "@/config/wedding";

const ThemeContext = createContext<ThemeColors>(getTheme());

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMemo(() => getTheme(), []);

  useEffect(() => {
    const root = document.documentElement;

    // Inject all theme colors as CSS variables
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-light", theme.primaryLight);
    root.style.setProperty("--primary-dark", theme.primaryDark);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--secondary-light", theme.secondaryLight);
    root.style.setProperty("--bg", theme.background);
    root.style.setProperty("--bg-alt", theme.backgroundAlt);
    root.style.setProperty("--bg-dark", theme.backgroundDark);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--text-light", theme.textLight);
    root.style.setProperty("--cover-bg", theme.coverBg);
    root.style.setProperty("--cover-bg-mid", theme.coverBgMid);
    root.style.setProperty("--cover-text", theme.coverText);
    root.style.setProperty("--particle", theme.particle);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
