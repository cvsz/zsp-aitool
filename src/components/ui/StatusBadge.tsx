type StatusTone = "default" | "muted" | "dark" | "info" | "success" | "warning" | "danger";

const toneMap: Record<StatusTone, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  muted: "bg-slate-50 text-slate-600 border-slate-200",
  dark: "bg-slate-900 text-white border-slate-700",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export function StatusBadge({ label, tone = "info" }: { label: string; tone?: StatusTone }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneMap[tone]}`}>{label}</span>;
}
