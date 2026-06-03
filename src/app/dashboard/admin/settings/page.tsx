import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { getAdminSettingsSummary } from "@/services/admin-data-service";

export default async function AdminSettingsPage() {
  const access = await requireAdminAccess();
  const data = await getAdminSettingsSummary();

  return (
    <AdminShell title="Admin · Settings" description="นโยบายและค่าควบคุมระดับแอดมิน (อ่านอย่างเดียว)" allowed={access.allowed} denialReason={access.reason}>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">ค่าตั้งค่า</h2>
        <div className="mt-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">Admin panel enabled</p>
            <p className="font-medium text-slate-900">{data.adminPanelEnabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">Dangerous actions</p>
            <p className="font-medium text-slate-900">ปิดใช้งาน</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">Data exposure policy</p>
            <p className="font-medium text-slate-900">{data.dataExposurePolicy}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">ผู้ใช้ทั้งหมด</p>
            <p className="font-medium text-slate-900">{data.totalUsers}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">สินค้าทั้งหมด</p>
            <p className="font-medium text-slate-900">{data.totalProducts}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">เรนเดอร์ทั้งหมด</p>
            <p className="font-medium text-slate-900">{data.totalRenders}</p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
