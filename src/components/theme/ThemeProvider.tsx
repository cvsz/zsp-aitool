"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type BackgroundTheme = "default" | "slate" | "indigo" | "emerald" | "amber" | "rose" | "zinc" | "neutral";

const STORAGE_THEME_KEY = "zsp_theme_mode";
const STORAGE_BG_KEY = "zsp_background_theme";
const BACKGROUND_OPTIONS: BackgroundTheme[] = ["default", "slate", "indigo", "emerald", "amber", "rose", "zinc", "neutral"];

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  background: BackgroundTheme;
  setMode: (mode: ThemeMode) => void;
  setBackground: (background: BackgroundTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  if (mode === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return mode;
}

function isBackgroundTheme(value: string | null): value is BackgroundTheme {
  return !!value && BACKGROUND_OPTIONS.includes(value as BackgroundTheme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [background, setBackground] = useState<BackgroundTheme>("default");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_THEME_KEY);
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      setMode(storedTheme);
    }

    const storedBackground = window.localStorage.getItem(STORAGE_BG_KEY);
    if (isBackgroundTheme(storedBackground)) {
      setBackground(storedBackground);
    }
  }, []);

  useEffect(() => {
    const next = resolveTheme(mode);
    setResolvedTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem(STORAGE_THEME_KEY, mode);

    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const systemTheme = media.matches ? "dark" : "light";
      setResolvedTheme(systemTheme);
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
      document.documentElement.style.colorScheme = systemTheme;
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.bgTheme = background;
    window.localStorage.setItem(STORAGE_BG_KEY, background);
  }, [background]);

  const value = useMemo(() => ({ mode, setMode, resolvedTheme, background, setBackground }), [mode, resolvedTheme, background]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export const ALLOWLISTED_BACKGROUNDS = BACKGROUND_OPTIONS;
