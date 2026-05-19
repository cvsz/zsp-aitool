import { AdminPlaceholderTable } from "@/components/admin/AdminPlaceholderTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";

export default async function AdminAuditLogsPage() {
  const access = await requireAdminAccess();

  return (
    <AdminShell title="Admin · Audit Logs" description="บันทึกเหตุการณ์แบบสรุปและปกป้องข้อมูลส่วนตัว" allowed={access.allowed} denialReason={access.reason}>
      <AdminPlaceholderTable title="สรุปเหตุการณ์" rows={[{ key: "เหตุการณ์รวม", value: "-" }, { key: "ความผิดพลาดล่าสุด", value: "-" }, { key: "การแจ้งเตือนความปลอดภัย", value: "-" }]} />
    </AdminShell>
  );
}
