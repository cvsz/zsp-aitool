import type { ReactNode } from "react";

type CardTone = "default" | "muted" | "dark" | "info" | "success" | "warning" | "danger";

type CardProps = {
  children: ReactNode;
  className?: string;
  tone?: CardTone;
};

const toneClasses: Record<CardTone, string> = {
  default: "border-slate-200 bg-white text-slate-950 shadow-sm",
  muted: "border-slate-200 bg-slate-50 text-slate-900 shadow-sm",
  dark: "border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-900/10",
  info: "border-sky-200 bg-sky-50 text-sky-950 shadow-sm",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-sm",
  warning: "border-amber-200 bg-amber-50 text-amber-950 shadow-sm",
  danger: "border-rose-200 bg-rose-50 text-rose-950 shadow-sm",
};

export function Card({ children, className = "", tone = "default" }: CardProps) {
  return <section className={`rounded-3xl border ${toneClasses[tone]} ${className}`.trim()}>{children}</section>;
}

export function CardHeader({ children, className = "" }: Omit<CardProps, "tone">) {
  return <div className={`border-b border-current/10 px-6 py-4 ${className}`.trim()}>{children}</div>;
}

export function CardContent({ children, className = "" }: Omit<CardProps, "tone">) {
  return <div className={`px-6 py-5 ${className}`.trim()}>{children}</div>;
}

export function CardTitle({ children, className = "" }: Omit<CardProps, "tone">) {
  return <h2 className={`text-lg font-semibold tracking-tight ${className}`.trim()}>{children}</h2>;
}

export function CardDescription({ children, className = "" }: Omit<CardProps, "tone">) {
  return <p className={`mt-1 text-sm leading-6 opacity-80 ${className}`.trim()}>{children}</p>;
}
