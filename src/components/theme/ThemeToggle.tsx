"use client";
import { ThemeMode, useTheme } from "@/components/theme/ThemeProvider";
const options: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "สว่าง" },
  { value: "dark", label: "มืด" },
  { value: "system", label: "ตามระบบ" },
];
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <fieldset className="space-y-2" aria-label="โหมดการแสดงผล">
      <legend className="text-sm font-semibold text-slate-700 dark:text-slate-200">ธีมการแสดงผล</legend>
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        {options.map((option) => (
          <button key={option.value} type="button" onClick={() => setMode(option.value)} className={`rounded-lg px-3 py-1.5 text-sm transition ${mode === option.value ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
