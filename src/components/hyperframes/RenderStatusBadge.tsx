import type { RenderJobStatus } from "@prisma/client";

const styles: Record<RenderJobStatus, string> = { PENDING: "bg-amber-400/20 text-amber-400 border border-amber-400/30", RUNNING: "bg-blue-400/20 text-blue-400 border border-blue-400/30", COMPLETED: "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30", FAILED: "bg-rose-400/20 text-rose-400 border border-rose-400/30", CANCELLED: "bg-white/10 text-slate-300 border border-white/20" };
const labels: Record<RenderJobStatus, string> = { PENDING: "รอคิว", RUNNING: "กำลังเรนเดอร์", COMPLETED: "สำเร็จ", FAILED: "ล้มเหลว", CANCELLED: "ยกเลิก" };

export function RenderStatusBadge({ status }: { status: RenderJobStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}
