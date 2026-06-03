import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { getAdminUsersSummary } from "@/services/admin-data-service";

export default async function AdminUsersPage() {
  const access = await requireAdminAccess();
  const data = await getAdminUsersSummary();

  return (
    <AdminShell title="Admin · Users" description="หน้าผู้ใช้งานสำหรับผู้ดูแลระบบ (อ่านอย่างเดียว)" allowed={access.allowed} denialReason={access.reason}>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">สรุปผู้ใช้งาน</h2>
        <div className="mt-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">ผู้ใช้ทั้งหมด</p>
            <p className="font-medium text-slate-900">{data.totalUsers}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">ผู้ใช้ใหม่ 7 วัน</p>
            <p className="font-medium text-slate-900">{data.newUsers7d}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">บัญชีฟรี</p>
            <p className="font-medium text-slate-900">{data.flaggedAccounts}</p>
          </div>
        </div>
        {data.byPlan.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">จำแนกตามแพ็กเกจ</h3>
            <div className="mt-2 space-y-1">
              {data.byPlan.map((p) => (
                <div key={p.plan} className="flex items-center justify-between text-sm">
                  <p className="text-slate-500">{p.plan}</p>
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
