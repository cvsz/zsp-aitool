import { AdminPlaceholderTable } from "@/components/admin/AdminPlaceholderTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";

export default async function AdminProductsPage() {
  const access = await requireAdminAccess();

  return (
    <AdminShell title="Admin · Products" description="ภาพรวมคลังสินค้าแบบ aggregate" allowed={access.allowed} denialReason={access.reason}>
      <AdminPlaceholderTable title="สรุปสินค้า" rows={[{ key: "สินค้าทั้งหมด", value: "-" }, { key: "เพิ่มใหม่วันนี้", value: "-" }, { key: "หมวดหมู่ยอดนิยม", value: "-" }]} />
    </AdminShell>
  );
}
