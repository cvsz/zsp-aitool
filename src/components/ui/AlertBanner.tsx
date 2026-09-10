import { Card, CardContent } from "@/components/ui/Card";

type AlertVariant = "warning" | "error" | "success" | "info";
type AlertTone = "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";

type AlertBannerProps = {
  title: string;
  description: string;
  variant?: AlertVariant;
  tone?: AlertTone;
  icon?: string;
};

const variantStyles: Record<AlertVariant, string> = {
  warning: "border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200",
  error: "border-rose-200 bg-rose-50/90 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200",
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200",
  info: "border-sky-200 bg-sky-50/90 text-sky-900 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200",
};

const toneStyles: Record<AlertTone, string> = {
  default: "",
  muted: "border-slate-200 bg-slate-100/90 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
  info: "border-sky-200 bg-sky-50/90 text-sky-900 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200",
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200",
  warning: "border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200",
  danger: "border-rose-200 bg-rose-50/90 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200",
  dark: "border-slate-800 bg-slate-900 text-slate-100 dark:border-slate-700 dark:bg-slate-950",
};

export function AlertBanner({ title, description, variant = "warning", tone, icon }: AlertBannerProps) {
  const style = tone ? toneStyles[tone] : variantStyles[variant];

  return (
    <Card className={style}>
      <CardContent>
        <div className="flex items-start gap-2.5">
          {icon ? <span className="text-lg flex-shrink-0">{icon}</span> : null}
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-0.5 text-sm leading-relaxed opacity-90">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
