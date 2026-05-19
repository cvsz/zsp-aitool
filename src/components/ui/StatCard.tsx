import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "success" | "warning" | "danger" | "info";
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-slate-500">{label}</p>
          {hint ? <StatusBadge label={hint} tone={tone ?? "info"} /> : null}
        </div>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
