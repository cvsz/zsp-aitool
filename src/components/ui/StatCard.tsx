import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "muted" | "dark" | "success" | "warning" | "danger" | "info";
  icon?: string;
};

export function StatCard({ label, value, hint, tone, icon }: StatCardProps) {
  return (
    <Card tone={tone === "dark" ? "dark" : "default"} className="transition-transform duration-200 hover:-translate-y-0.5">
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {icon ? <span className="text-base">{icon}</span> : null}
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          </div>
          {hint ? <StatusBadge label={hint} tone={tone ?? "info"} /> : null}
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </CardContent>
    </Card>
  );
}
