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
  primary: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 shadow-sm",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm",
  ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white",
  danger: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-sm",
};

const toneClasses: Record<ButtonTone, string> = {
  default: "focus-visible:ring-sky-500",
  muted: "focus-visible:ring-slate-400",
  info: "focus-visible:ring-sky-400",
  success: "focus-visible:ring-emerald-400",
  warning: "focus-visible:ring-amber-400",
  danger: "focus-visible:ring-rose-400",
  dark: "focus-visible:ring-slate-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-9 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-base rounded-xl",
};

export function Button({ children, className = "", variant = "primary", tone = "default", size = "md", busy = false, disabled, ...props }: ButtonProps) {
  const isDisabled = Boolean(disabled || busy);

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
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
