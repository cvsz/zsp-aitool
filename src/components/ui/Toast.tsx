type ToastType = "success" | "error" | "info";

type ToastTone = "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";

type ToastProps = {
  message: string;
  type?: ToastType;
  tone?: ToastTone;
  className?: string;
};

const typeTones: Record<ToastType, string> = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-slate-800",
};

const toneClasses: Record<ToastTone, string> = {
  default: "bg-slate-800",
  muted: "bg-slate-600",
  info: "bg-sky-700",
  success: "bg-emerald-600",
  warning: "bg-amber-600",
  danger: "bg-red-600",
  dark: "bg-black",
};

export function Toast({ message, type = "info", tone, className = "" }: ToastProps) {
  const appliedTone = tone ? toneClasses[tone] : typeTones[type];

  return <div className={`fixed right-4 top-4 z-50 rounded-2xl px-4 py-2 text-sm text-white shadow-lg ${appliedTone} ${className}`.trim()} role="status" aria-live="polite">{message}</div>;
}
