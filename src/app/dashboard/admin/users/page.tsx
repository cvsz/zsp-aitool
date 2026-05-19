import { AdminPlaceholderTable } from "@/components/admin/AdminPlaceholderTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";

export default async function AdminUsersPage() {
  const access = await requireAdminAccess();

  return (
    <AdminShell title="Admin · Users" description="หน้าผู้ใช้งานสำหรับผู้ดูแลระบบ (อ่านอย่างเดียว)" allowed={access.allowed} denialReason={access.reason}>
      <AdminPlaceholderTable title="สรุปผู้ใช้งาน" rows={[{ key: "ผู้ใช้ทั้งหมด", value: "-" }, { key: "ผู้ใช้ใหม่ 7 วัน", value: "-" }, { key: "บัญชีที่ต้องตรวจสอบ", value: "-" }]} />
    </AdminShell>
  );
}
