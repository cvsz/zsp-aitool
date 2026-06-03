import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { getAdminRendersSummary } from "@/services/admin-data-service";

export default async function AdminRendersPage() {
  const access = await requireAdminAccess();
  const data = await getAdminRendersSummary();

  return (
    <AdminShell title="Admin · Renders" description="สรุปคิวเรนเดอร์ HyperFrames แบบปลอดภัย" allowed={access.allowed} denialReason={access.reason}>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">สถานะเรนเดอร์</h2>
        <div className="mt-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">คิวรอ</p>
            <p className="font-medium text-slate-900">{data.pending}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">กำลังประมวลผล</p>
            <p className="font-medium text-slate-900">{data.running}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">สำเร็จ</p>
            <p className="font-medium text-slate-900">{data.completed}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">ล้มเหลว</p>
            <p className="font-medium text-slate-900">{data.failed}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">ยกเลิก</p>
            <p className="font-medium text-slate-900">{data.cancelled}</p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
