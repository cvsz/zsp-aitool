import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonTone = "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  busy?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-slate-950 text-white hover:bg-slate-800",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

const toneClasses: Record<ButtonTone, string> = {
  default: "focus-visible:ring-slate-400",
  muted: "focus-visible:ring-slate-300",
  info: "focus-visible:ring-sky-400",
  success: "focus-visible:ring-emerald-400",
  warning: "focus-visible:ring-amber-400",
  danger: "focus-visible:ring-rose-400",
  dark: "focus-visible:ring-slate-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export function Button({ children, className = "", variant = "primary", tone = "default", size = "md", busy = false, disabled, ...props }: ButtonProps) {
  const isDisabled = Boolean(disabled || busy);

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        toneClasses[tone],
        sizeClasses[size],
        className,
      ].join(" ")}
      aria-busy={busy || undefined}
    >
      {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}
