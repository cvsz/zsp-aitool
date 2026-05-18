import type { RenderJobStatus } from "@prisma/client";

const styles: Record<RenderJobStatus, string> = { PENDING: "bg-amber-100 text-amber-800", RUNNING: "bg-blue-100 text-blue-800", COMPLETED: "bg-emerald-100 text-emerald-800", FAILED: "bg-rose-100 text-rose-800", CANCELLED: "bg-slate-100 text-slate-700" };
const labels: Record<RenderJobStatus, string> = { PENDING: "รอคิว", RUNNING: "กำลังเรนเดอร์", COMPLETED: "สำเร็จ", FAILED: "ล้มเหลว", CANCELLED: "ยกเลิก" };

export function RenderStatusBadge({ status }: { status: RenderJobStatus }) { return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>; }
