export function AdminStatusPanel({ status, description }: { status: "healthy" | "degraded" | "disabled"; description: string }) {
  const tone = status === "healthy"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : status === "degraded"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-sm font-semibold">System Health</p>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}
