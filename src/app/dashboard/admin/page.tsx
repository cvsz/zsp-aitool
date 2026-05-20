import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatusPanel } from "@/components/admin/AdminStatusPanel";
import { requireAdminAccess } from "@/lib/admin/access";
import { getAdminOverviewSummary } from "@/services/admin-overview-service";

export default async function AdminOverviewPage() {
  const access = await requireAdminAccess();
  const summary = access.allowed ? await getAdminOverviewSummary() : null;

  const summaryCards = summary ? [
    { label: "ผู้ใช้งานทั้งหมด", value: summary.totals.users.toLocaleString("th-TH"), note: "สรุปแบบปลอดภัย (aggregate only)" },
    { label: "สินค้าทั้งหมด", value: summary.totals.products.toLocaleString("th-TH"), note: "ยังไม่เปิดเผยข้อมูลรายบุคคล" },
    { label: "คอนเทนต์ที่สร้างแล้ว", value: summary.totals.contentGenerations.toLocaleString("th-TH"), note: "เฉพาะจำนวนรวม" },
    { label: "งานเรนเดอร์ทั้งหมด", value: summary.totals.renderJobs.toLocaleString("th-TH"), note: "สรุประดับระบบ ไม่แสดงข้อมูลไฟล์" },
    { label: "เรนเดอร์ล้มเหลว", value: summary.totals.failedRenders.toLocaleString("th-TH"), note: "จำนวนรวมที่ไม่สำเร็จ" },
    { label: "คิว Pending/Running", value: `${summary.totals.pendingRenders} / ${summary.totals.runningRenders}`, note: "อ่านอย่างเดียวจากคิวรวม" },
  ] : [];

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

      {summary ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminMetricCard label="สถานะแอป" value={summary.ops.appHealth === "healthy" ? "ปกติ" : "เฝ้าระวัง"} note="ไม่แสดง stack trace" />
          <AdminMetricCard label="Schema Drift" value={summary.ops.schemaDrift === "ok" ? "พร้อมตรวจ" : "ไม่ทราบ"} note="ตรวจผ่านสคริปต์ db:schema-drift-check" />
          <AdminMetricCard label="Watchdog Queue" value={summary.ops.hyperframesQueue.watchdogConfigured ? "กำหนดค่าแล้ว" : "ยังไม่กำหนด"} note="ไม่มีปุ่ม systemctl บน UI" />
          <AdminMetricCard label="Shopee Open API" value={summary.ops.shopeeFoundation.foundationReady ? "Foundation Ready" : "กำลังตั้งค่า"} note={`โหมด ${summary.ops.shopeeFoundation.environment}`} />
          <AdminMetricCard label="เหตุการณ์ล่าสุด (24 ชม.)" value={`${summary.ops.recentAggregateEvents.newRenderJobs24h} jobs`} note={`ล้มเหลว ${summary.ops.recentAggregateEvents.failedRenderJobs24h} งาน`} />
          <AdminMetricCard label="การเติบโต 7 วัน" value={`ผู้ใช้ใหม่ ${summary.ops.recentAggregateEvents.newUsers7d}`} note={`สินค้าใหม่ ${summary.ops.recentAggregateEvents.newProducts7d}`} />
        </div>
      ) : null}

      <AdminStatusPanel
        status={summary ? (summary.ops.appHealth === "degraded" ? "degraded" : "healthy") : "disabled"}
        description={summary
          ? "แสดงเฉพาะสถานะเชิงสรุป ปลอดภัยต่อการปฏิบัติการ และไม่มีคำสั่งควบคุมระบบ"
          : "โหมดแอดมินถูกจำกัดไว้เพื่อความปลอดภัย ยังไม่เปิดใช้งานการจัดการระบบจริง"}
      />
    </AdminShell>
  );
}
