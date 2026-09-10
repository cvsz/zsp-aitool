type StatusTone = "default" | "muted" | "dark" | "info" | "success" | "warning" | "danger";

const toneMap: Record<StatusTone, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  muted: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
  dark: "bg-slate-900 text-white border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:border-slate-700",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  danger: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
  info: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
};

export function StatusBadge({ label, tone = "info" }: { label: string; tone?: StatusTone }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight ${toneMap[tone]}`}>{label}</span>;
}
