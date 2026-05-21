import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { collectBackendMonitorData } from "@/services/BackendMonitorService";

export default async function AdminBackendMonitorPage() {
  const access = await requireAdminAccess();
  const data = access.allowed ? await collectBackendMonitorData() : null;

  return (
    <AdminShell title="Admin · Backend Monitor" description="ภาพรวม backend แบบ read-only และปกปิดข้อมูลอ่อนไหว" allowed={access.allowed} denialReason={access.reason}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard label="App Reachable" value={data?.app.reachable ? "พร้อม" : "ไม่พร้อม"} note="HTTP 127.0.0.1:3001" />
        <AdminMetricCard label="App Service" value={data?.app.serviceActive ? "active" : "unknown"} note="systemd guard" />
        <AdminMetricCard label="Worker Service" value={data?.worker.serviceActive ? "active" : "unknown"} note="zsp-hyperframes-worker" />
        <AdminMetricCard label="DB" value={data?.db.reachable ? "reachable" : "unreachable"} note="ไม่มี stack trace" />
        <AdminMetricCard label="Products" value={String(data?.db.productCount ?? 0)} note="aggregate only" />
        <AdminMetricCard label="Affiliate Links" value={String(data?.db.affiliateLinkCount ?? 0)} note="aggregate only" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <p className="font-medium">Shopee ingestion counts</p>
        <pre className="mt-2 overflow-auto rounded-lg bg-slate-50 p-3">{JSON.stringify(data?.db.ingestionByStatus ?? {}, null, 2)}</pre>
        <p className="mt-3 font-medium">HyperFrames queue</p>
        <pre className="mt-2 overflow-auto rounded-lg bg-slate-50 p-3">{JSON.stringify(data?.hyperframes ?? null, null, 2)}</pre>
        <p className="mt-3 font-medium">Warnings</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">{(data?.warnings ?? ["ยังไม่มีข้อมูล"]).map((w) => <li key={w}>{w}</li>)}</ul>
      </div>
    </AdminShell>
  );
}
