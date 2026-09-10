"use client";

import { ThemeMode, useTheme } from "@/components/theme/ThemeProvider";

const options: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "สว่าง", icon: "☀️" },
  { value: "dark", label: "มืด", icon: "🌙" },
  { value: "system", label: "ระบบ", icon: "💻" },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-sm">
      {options.map((option) => {
        const active = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              active
                ? "bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
