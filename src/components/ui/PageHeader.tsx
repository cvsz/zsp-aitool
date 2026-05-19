import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  tone?: "default" | "muted" | "dark";
};

const toneClasses: Record<NonNullable<PageHeaderProps["tone"]>, string> = {
  default: "text-slate-900",
  muted: "text-slate-700",
  dark: "text-slate-100",
};

export function PageHeader({ title, subtitle, actions, tone = "default" }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className={`text-2xl font-semibold ${toneClasses[tone]}`}>{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
