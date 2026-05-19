import { Card, CardContent } from "@/components/ui/Card";

type AlertVariant = "warning" | "error" | "success" | "info";

type AlertBannerProps = {
  title: string;
  description: string;
  variant?: AlertVariant;
};

const variantStyles: Record<AlertVariant, string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

export function AlertBanner({ title, description, variant = "warning" }: AlertBannerProps) {
  const style = variantStyles[variant];

  return (
    <Card className={style}>
      <CardContent>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm/6 opacity-90">{description}</p>
      </CardContent>
    </Card>
  );
}
