type EmptyStateTone = "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";

type EmptyStateProps = {
  title: string;
  description: string;
  tone?: EmptyStateTone;
  className?: string;
};

const toneClasses: Record<EmptyStateTone, string> = {
  default: "border-slate-300 bg-white text-slate-900",
  muted: "border-slate-200 bg-slate-50 text-slate-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-rose-200 bg-rose-50 text-rose-900",
  dark: "border-slate-700 bg-slate-900 text-slate-100",
};

export function EmptyState({ title, description, tone = "default", className = "" }: EmptyStateProps) {
  return (
    <div className={`rounded-2xl border border-dashed p-8 text-center ${toneClasses[tone]} ${className}`.trim()}>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{description}</p>
    </div>
  );
}
