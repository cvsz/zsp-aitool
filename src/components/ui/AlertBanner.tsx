import { Card, CardContent } from "@/components/ui/Card";

type AlertVariant = "warning" | "error" | "success" | "info";
type AlertTone = "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";

type AlertBannerProps = {
  title: string;
  description: string;
  variant?: AlertVariant;
  tone?: AlertTone;
};

const variantStyles: Record<AlertVariant, string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

const toneStyles: Record<AlertTone, string> = {
  default: "",
  muted: "border-slate-200 bg-slate-100 text-slate-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-rose-200 bg-rose-50 text-rose-800",
  dark: "border-slate-800 bg-slate-900 text-slate-100",
};

export function AlertBanner({ title, description, variant = "warning", tone }: AlertBannerProps) {
  const style = tone ? toneStyles[tone] : variantStyles[variant];

  return (
    <Card className={style}>
      <CardContent>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm/6 opacity-90">{description}</p>
      </CardContent>
    </Card>
  );
}
