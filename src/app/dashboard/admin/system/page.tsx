import { AdminStatusPanel } from "@/components/admin/AdminStatusPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { getAdminSystemStatus } from "@/services/admin-data-service";

export default async function AdminSystemPage() {
  const access = await requireAdminAccess();
  const data = await getAdminSystemStatus();

  return (
    <AdminShell title="Admin · System Health" description="สถานะระบบระดับสูงโดยไม่เปิดเผยข้อมูลภายใน" allowed={access.allowed} denialReason={access.reason}>
      <AdminStatusPanel status={data.appHealth} description={data.appHealth === "healthy" ? "ระบบทำงานปกติ" : "มีการทำงานผิดปกติใน 24 ชม.ล่าสุด"} />
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">รายละเอียดสถานะ</h2>
        <div className="mt-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">ความสมบูรณ์ของ Schema</p>
            <p className="font-medium text-slate-900">{data.schemaDrift === "ok" ? "ปกติ" : "ไม่ทราบสถานะ"}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">คิว HyperFrames: รอ</p>
            <p className="font-medium text-slate-900">{data.hyperframesQueue.pending}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">คิว HyperFrames: กำลังทำงาน</p>
            <p className="font-medium text-slate-900">{data.hyperframesQueue.running}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">ล้มเหลวใน 24 ชม.</p>
            <p className="font-medium text-slate-900">{data.recentFailures24h}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">Watchdog</p>
            <p className="font-medium text-slate-900">{data.hyperframesQueue.watchdogConfigured ? "ตั้งค่าแล้ว" : "ไม่ได้ตั้งค่า"}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">Shopee Foundation</p>
            <p className="font-medium text-slate-900">{data.shopeeFoundation.enabled ? "เปิด" : "ปิด"}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">สภาพแวดล้อม Shopee</p>
            <p className="font-medium text-slate-900">{data.shopeeFoundation.environment}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">งานทั้งหมด</p>
            <p className="font-medium text-slate-900">{data.totalJobs}</p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
