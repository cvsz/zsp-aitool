"use client";

import { ALLOWLISTED_BACKGROUNDS, BackgroundTheme, useTheme } from "@/components/theme/ThemeProvider";

const labels: Record<BackgroundTheme, string> = {
  default: "ค่าเริ่มต้น",
  slate: "เทาสเลต",
  indigo: "คราม",
  emerald: "มรกต",
  amber: "อำพัน",
  rose: "โรส",
  zinc: "ซิงก์",
  neutral: "กลาง",
};

export function BackgroundColorSelect() {
  const { background, setBackground } = useTheme();

  return (
    <fieldset className="space-y-2" aria-label="สีพื้นหลัง">
      <legend className="text-sm font-semibold text-slate-700 dark:text-slate-200">สีพื้นหลัง</legend>
      <select
        value={background}
        onChange={(event) => setBackground(event.target.value as BackgroundTheme)}
        className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {ALLOWLISTED_BACKGROUNDS.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500 dark:text-slate-400">เลือกได้เฉพาะสีที่กำหนดไว้เพื่อความอ่านง่ายและปลอดภัยของระบบ</p>
    </fieldset>
  );
}
