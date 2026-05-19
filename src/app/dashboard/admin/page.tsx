import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatusPanel } from "@/components/admin/AdminStatusPanel";
import { requireAdminAccess } from "@/lib/admin/access";

const summaryCards = [
  { label: "ผู้ใช้งานทั้งหมด", value: "-", note: "สรุปแบบปลอดภัย (aggregate only)" },
  { label: "สินค้าทั้งหมด", value: "-", note: "ยังไม่เปิดเผยข้อมูลรายบุคคล" },
  { label: "คอนเทนต์ที่สร้างแล้ว", value: "-", note: "เฉพาะจำนวนรวม" },
  { label: "งานเรนเดอร์ทั้งหมด", value: "-", note: "ไม่แสดง output path" },
  { label: "เรนเดอร์ล้มเหลว", value: "-", note: "ตัวเลข placeholder" },
  { label: "คิว Pending/Running", value: "- / -", note: "ตัวเลข placeholder" },
] as const;

export default async function AdminOverviewPage() {
  const access = await requireAdminAccess();

  return (
    <AdminShell
      title="Admin Overview"
      description="ภาพรวมสำหรับผู้ดูแลระบบ (ปลอดภัยและอ่านอย่างเดียว)"
      allowed={access.allowed}
      denialReason={access.reason}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => <AdminMetricCard key={card.label} label={card.label} value={card.value} note={card.note} />)}
      </div>
      <AdminStatusPanel status="disabled" description="โหมดแอดมินถูกจำกัดไว้เพื่อความปลอดภัย ยังไม่เปิดใช้งานการจัดการระบบจริง" />
    </AdminShell>
  );
}
