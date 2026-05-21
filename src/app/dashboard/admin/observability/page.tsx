import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { getObservabilitySummary, getRecentObservabilityEvents } from "@/services/ObservabilityService";

export default async function AdminObservabilityPage() {
  const access = await requireAdminAccess();
  const summary = access.allowed ? await getObservabilitySummary() : null;
  const events = access.allowed ? await getRecentObservabilityEvents(25) : [];

  return (
    <AdminShell title="Admin · Observability" description="ภาพรวมความเสถียร API, DB, Worker และงานนำเข้า" allowed={access.allowed} denialReason={access.reason}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard label="Errors 1h" value={String(summary?.errorsLast1h ?? 0)} note="redacted summary" />
        <AdminMetricCard label="Errors 24h" value={String(summary?.errorsLast24h ?? 0)} note="redacted summary" />
        <AdminMetricCard label="Slow routes" value={String(summary?.slowApiRoutes.length ?? 0)} note="duration >= 1500ms" />
        <AdminMetricCard label="DB avg ms" value={String(summary?.dbLatencySummary.avgDurationMs ?? 0)} note="last 24h" />
        <AdminMetricCard label="DB p95 ms" value={String(summary?.dbLatencySummary.p95DurationMs ?? 0)} note="last 24h" />
        <AdminMetricCard label="Worker pending" value={String(summary?.worker?.pending ?? 0)} note="HyperFrames queue" />
      </div>
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Recent redacted events</h2>
        {events.length === 0 ? <p className="mt-2 text-sm text-slate-500">ยังไม่มีข้อมูลเหตุการณ์</p> : (
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b"><th className="p-2">Event</th><th className="p-2">Level</th><th className="p-2">Source</th><th className="p-2">Duration</th></tr></thead>
              <tbody>{events.map((event) => <tr className="border-b" key={event.id}><td className="p-2">{event.event}</td><td className="p-2">{event.level}</td><td className="p-2">{event.source}</td><td className="p-2">{event.durationMs ?? "-"}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
