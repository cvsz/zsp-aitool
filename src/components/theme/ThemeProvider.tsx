"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
export type ThemeMode = "light" | "dark" | "system";
const STORAGE_KEY = "zsp_theme_mode";
type ThemeContextValue = { mode: ThemeMode; resolvedTheme: "light" | "dark"; setMode: (mode: ThemeMode) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
function resolveTheme(mode: ThemeMode): "light" | "dark" { if (typeof window === "undefined") return "light"; if (mode === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; return mode; }
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  useEffect(() => { const stored = window.localStorage.getItem(STORAGE_KEY); if (stored === "light" || stored === "dark" || stored === "system") setMode(stored); }, []);
  useEffect(() => {
    const next = resolveTheme(mode);
    setResolvedTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem(STORAGE_KEY, mode);
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
  const value = useMemo(() => ({ mode, setMode, resolvedTheme }), [mode, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error("useTheme must be used within ThemeProvider"); return context; }
