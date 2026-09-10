import type { ReactNode } from "react";

type CardTone = "default" | "muted" | "dark" | "info" | "success" | "warning" | "danger";

type CardProps = {
  children: ReactNode;
  className?: string;
  tone?: CardTone;
};

const toneClasses: Record<CardTone, string> = {
  default: "border-slate-200/80 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-sm",
  muted: "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 shadow-sm",
  dark: "border-slate-800 bg-slate-950 text-white shadow-xl",
  info: "border-sky-200 bg-sky-50/80 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200 shadow-sm",
  success: "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200 shadow-sm",
  warning: "border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 shadow-sm",
  danger: "border-rose-200 bg-rose-50/80 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200 shadow-sm",
};

export function Card({ children, className = "", tone = "default" }: CardProps) {
  return <section className={`rounded-2xl border ${toneClasses[tone]} ${className}`.trim()}>{children}</section>;
}

export function CardHeader({ children, className = "" }: Omit<CardProps, "tone">) {
  return <div className={`border-b border-slate-100 dark:border-slate-800 px-6 py-4 ${className}`.trim()}>{children}</div>;
}

export function CardContent({ children, className = "" }: Omit<CardProps, "tone">) {
  return <div className={`px-6 py-5 ${className}`.trim()}>{children}</div>;
}

export function CardTitle({ children, className = "" }: Omit<CardProps, "tone">) {
  return <h2 className={`text-lg font-semibold tracking-tight ${className}`.trim()}>{children}</h2>;
}

export function CardDescription({ children, className = "" }: Omit<CardProps, "tone">) {
  return <p className={`mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400 ${className}`.trim()}>{children}</p>;
}
