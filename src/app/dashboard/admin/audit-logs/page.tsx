import Link from "next/link";

import { AdminPlaceholderTable } from "@/components/admin/AdminPlaceholderTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { getAdminOverviewSummary } from "@/services/admin-overview-service";

export default async function AdminAuditLogsPage() {
  const access = await requireAdminAccess();
  const summary = access.allowed ? await getAdminOverviewSummary() : null;

  return (
    <AdminShell title="Admin · Audit Logs" description="บันทึกเหตุการณ์แบบสรุปและปกป้องข้อมูลส่วนตัว" allowed={access.allowed} denialReason={access.reason}>
      {summary ? (
        <AdminPlaceholderTable
          title="สรุปเหตุการณ์ล่าสุด (Aggregate Only)"
          rows={[
            { key: "Render jobs 24 ชั่วโมง", value: String(summary.ops.recentAggregateEvents.newRenderJobs24h) },
            { key: "Render fail 24 ชั่วโมง", value: String(summary.ops.recentAggregateEvents.failedRenderJobs24h) },
            { key: "ผู้ใช้ใหม่ 7 วัน", value: String(summary.ops.recentAggregateEvents.newUsers7d) },
            { key: "สินค้าใหม่ 7 วัน", value: String(summary.ops.recentAggregateEvents.newProducts7d) },
          ]}
        />
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold">ยังไม่เปิด raw audit log viewer</p>
        <p className="mt-2">เพื่อความปลอดภัย หน้านี้แสดงเฉพาะตัวเลขรวมและไม่แสดงข้อมูลส่วนบุคคล, secret, หรือ path ภายในระบบ.</p>
        <Link className="mt-3 inline-flex rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100" href="/docs/runbooks/admin-observability-ops-center">ดู runbook สำหรับการตรวจสอบและขั้นตอนปฏิบัติ</Link>
      </div>
    </AdminShell>
  );
}
