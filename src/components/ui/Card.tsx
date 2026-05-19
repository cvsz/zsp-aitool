import type { ReactNode } from "react";

type CardTone = "default" | "muted" | "dark" | "info";

type CardProps = {
  children: ReactNode;
  className?: string;
  tone?: CardTone;
};

const toneClasses: Record<CardTone, string> = {
  default: "border-slate-200 bg-white text-slate-950 shadow-sm",
  muted: "border-slate-200 bg-slate-50 text-slate-950 shadow-sm",
  dark: "border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-900/10",
  info: "border-indigo-100 bg-indigo-50 text-indigo-950 shadow-sm",
};

export function Card({ children, className = "", tone = "default" }: CardProps) {
  return <section className={`rounded-3xl border ${toneClasses[tone]} ${className}`.trim()}>{children}</section>;
}

export function CardHeader({ children, className = "" }: Omit<CardProps, "tone">) {
  return <div className={`border-b border-current/10 px-5 py-4 ${className}`.trim()}>{children}</div>;
}

export function CardContent({ children, className = "" }: Omit<CardProps, "tone">) {
  return <div className={`px-5 py-4 ${className}`.trim()}>{children}</div>;
}

export function CardTitle({ children, className = "" }: Omit<CardProps, "tone">) {
  return <h2 className={`text-lg font-bold tracking-tight ${className}`.trim()}>{children}</h2>;
}

export function CardDescription({ children, className = "" }: Omit<CardProps, "tone">) {
  return <p className={`mt-1 text-sm leading-6 opacity-70 ${className}`.trim()}>{children}</p>;
}
