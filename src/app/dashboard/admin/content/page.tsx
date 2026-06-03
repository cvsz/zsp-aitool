import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { getAdminContentSummary } from "@/services/admin-data-service";

export default async function AdminContentPage() {
  const access = await requireAdminAccess();
  const data = await getAdminContentSummary();

  return (
    <AdminShell title="Admin · Content" description="สรุปงานสร้างคอนเทนต์ AI" allowed={access.allowed} denialReason={access.reason}>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">สรุปคอนเทนต์</h2>
        <div className="mt-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">คอนเทนต์ทั้งหมด</p>
            <p className="font-medium text-slate-900">{data.totalContent}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">งานสำเร็จ</p>
            <p className="font-medium text-slate-900">{data.completed}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">งานล้มเหลว</p>
            <p className="font-medium text-slate-900">{data.failed}</p>
          </div>
        </div>
        {data.byPlatform.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">จำแนกตามแพลตฟอร์ม</h3>
            <div className="mt-2 space-y-1">
              {data.byPlatform.map((p) => (
                <div key={p.platform} className="flex items-center justify-between text-sm">
                  <p className="text-slate-500">{p.platform}</p>
                  <p className="font-medium text-slate-800">{p.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
