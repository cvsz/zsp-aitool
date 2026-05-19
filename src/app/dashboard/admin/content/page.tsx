import { AdminPlaceholderTable } from "@/components/admin/AdminPlaceholderTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";

export default async function AdminContentPage() {
  const access = await requireAdminAccess();

  return (
    <AdminShell title="Admin · Content" description="สรุปงานสร้างคอนเทนต์ AI" allowed={access.allowed} denialReason={access.reason}>
      <AdminPlaceholderTable title="สรุปคอนเทนต์" rows={[{ key: "คอนเทนต์ทั้งหมด", value: "-" }, { key: "งานสำเร็จ", value: "-" }, { key: "งานล้มเหลว", value: "-" }]} />
    </AdminShell>
  );
}
