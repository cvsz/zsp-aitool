import type { ReactNode } from "react";

type FormFieldTone = "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  tone?: FormFieldTone;
};

const toneClasses: Record<FormFieldTone, string> = {
  default: "text-slate-700",
  muted: "text-slate-600",
  info: "text-sky-700",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-rose-700",
  dark: "text-slate-100",
};

export function FormField({ label, htmlFor, hint, error, required, children, className = "", tone = "default" }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <label htmlFor={htmlFor} className={`text-sm font-medium ${toneClasses[tone]}`}>
        {label}
        {required ? <span className="ml-1 text-rose-600">*</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
