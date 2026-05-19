import { AdminPlaceholderTable } from "@/components/admin/AdminPlaceholderTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";

export default async function AdminRendersPage() {
  const access = await requireAdminAccess();

  return (
    <AdminShell title="Admin · Renders" description="สรุปคิวเรนเดอร์ HyperFrames แบบปลอดภัย" allowed={access.allowed} denialReason={access.reason}>
      <AdminPlaceholderTable title="สถานะเรนเดอร์" rows={[{ key: "คิวรอ", value: "-" }, { key: "กำลังประมวลผล", value: "-" }, { key: "ล้มเหลว", value: "-" }]} />
    </AdminShell>
  );
}
