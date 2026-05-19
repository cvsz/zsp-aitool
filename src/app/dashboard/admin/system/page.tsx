import { AdminStatusPanel } from "@/components/admin/AdminStatusPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";

export default async function AdminSystemPage() {
  const access = await requireAdminAccess();

  return (
    <AdminShell title="Admin · System Health" description="สถานะระบบระดับสูงโดยไม่เปิดเผยข้อมูลภายใน" allowed={access.allowed} denialReason={access.reason}>
      <AdminStatusPanel status="disabled" description="แสดงเฉพาะสถานะสุขภาพระดับสูง ไม่แสดง path ภายในหรือค่า secret" />
    </AdminShell>
  );
}
