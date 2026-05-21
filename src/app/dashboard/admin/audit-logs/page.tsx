import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { AdminAuditLogService } from "@/services/AdminAuditLogService";

export default async function AdminAuditLogsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const access = await requireAdminAccess();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? 20)));

  const data = access.allowed
    ? await AdminAuditLogService.listForAdmin({
        page,
        pageSize,
        action: typeof params.action === "string" ? params.action : undefined,
        targetType: typeof params.targetType === "string" ? params.targetType : undefined,
        actorUserId: typeof params.actorUserId === "string" ? params.actorUserId : undefined,
        status: typeof params.status === "string" ? params.status : undefined,
      })
    : null;

  return (
    <AdminShell title="Admin · Audit Logs" description="บันทึกเหตุการณ์สำคัญพร้อมการปกปิดข้อมูลละเอียดอ่อน" allowed={access.allowed} denialReason={access.reason}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">รายการเหตุการณ์ (ล่าสุดก่อน) — total {data?.total ?? 0}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="px-2 py-2">เวลา</th><th className="px-2 py-2">Action</th><th className="px-2 py-2">Target</th><th className="px-2 py-2">Actor</th><th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-2">{new Date(row.createdAt).toLocaleString("th-TH")}</td>
                  <td className="px-2 py-2 font-medium">{row.action}</td>
                  <td className="px-2 py-2">{row.targetType}:{row.targetId ?? "-"}</td>
                  <td className="px-2 py-2">{row.actorUserId ?? "system"}</td>
                  <td className="px-2 py-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
