import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { getAdminProductsSummary } from "@/services/admin-data-service";

export default async function AdminProductsPage() {
  const access = await requireAdminAccess();
  const data = await getAdminProductsSummary();

  return (
    <AdminShell title="Admin · Products" description="ภาพรวมคลังสินค้าแบบ aggregate" allowed={access.allowed} denialReason={access.reason}>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">สรุปสินค้า</h2>
        <div className="mt-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">สินค้าทั้งหมด</p>
            <p className="font-medium text-slate-900">{data.totalProducts}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">เพิ่มใหม่วันนี้</p>
            <p className="font-medium text-slate-900">{data.addedToday}</p>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">หมวดหมู่ยอดนิยม</p>
            <p className="font-medium text-slate-900">{data.topCategory}</p>
          </div>
        </div>
        {data.categoryCounts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">หมวดหมู่ทั้งหมด</h3>
            <div className="mt-2 space-y-1">
              {data.categoryCounts.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <p className="text-slate-500">{c.category}</p>
                  <p className="font-medium text-slate-800">{c.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
