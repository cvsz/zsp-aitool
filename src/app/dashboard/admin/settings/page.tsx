import { AdminPlaceholderTable } from "@/components/admin/AdminPlaceholderTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";

export default async function AdminSettingsPage() {
  const access = await requireAdminAccess();

  return (
    <AdminShell title="Admin · Settings" description="นโยบายและค่าควบคุมระดับแอดมิน (อ่านอย่างเดียว)" allowed={access.allowed} denialReason={access.reason}>
      <AdminPlaceholderTable title="ค่าตั้งค่า" rows={[{ key: "Admin panel enabled", value: "ควบคุมด้วย ADMIN_PANEL_ENABLED" }, { key: "Dangerous actions", value: "ปิดใช้งาน" }, { key: "Data exposure policy", value: "Aggregate only" }]} />
    </AdminShell>
  );
}
