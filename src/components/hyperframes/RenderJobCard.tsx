import type { RenderJobStatus } from "@prisma/client";
import { RenderStatusBadge } from "@/components/hyperframes/RenderStatusBadge";

export type RenderHistoryItem = {
  id: string;
  status: string;
  attempts: number;
  durationSeconds: number | null;
  width?: number | null;
  height?: number | null;
  createdAt: string | Date;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  failedAt?: string | Date | null;
  errorMessage?: string | null;
  downloadUrl?: string | null;
  thumbnailUrl?: string | null;
  canDownload?: boolean;
  canCancel?: boolean;
  canRetry?: boolean;
  metadata?: { platform?: string; aspectRatio?: string } | null;
};

export function RenderJobCard({ item, onCancel, onRetry }: { item: RenderHistoryItem; onCancel: (id: string) => void; onRetry?: (id: string) => void }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <RenderStatusBadge status={item.status as RenderJobStatus} />
        <span className="text-xs text-slate-500">พยายาม {item.attempts} ครั้ง</span>
      </div>
      <div className="grid gap-1 text-sm text-slate-700">
        <div>สร้างเมื่อ: {new Date(item.createdAt).toLocaleString("th-TH")}</div>
        {item.startedAt ? <div>เริ่มเรนเดอร์: {new Date(item.startedAt).toLocaleString("th-TH")}</div> : null}
        {item.completedAt ? <div>เสร็จสิ้น: {new Date(item.completedAt).toLocaleString("th-TH")}</div> : null}
        {item.failedAt ? <div>ล้มเหลว: {new Date(item.failedAt).toLocaleString("th-TH")}</div> : null}
        <div>ระยะเวลา: {item.durationSeconds ?? "-"} วินาที</div>
        <div>แพลตฟอร์ม: {item.metadata?.platform ?? "-"} • สัดส่วน: {item.metadata?.aspectRatio ?? "-"}</div>
        {item.errorMessage ? <div className="text-rose-700">ข้อผิดพลาด: {item.errorMessage}</div> : null}
      </div>
      {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="ตัวอย่างภาพเรนเดอร์" className="mt-3 h-24 w-auto rounded border border-slate-200 object-cover" loading="lazy" /> : null}
      <div className="mt-3 flex gap-2">
        {item.canDownload && item.downloadUrl ? <a className="rounded bg-slate-900 px-3 py-2 text-sm text-white" href={item.downloadUrl}>ดาวน์โหลด</a> : null}
        {item.canCancel ? <button className="rounded border px-3 py-2 text-sm" onClick={() => onCancel(item.id)}>ยกเลิกงาน</button> : null}
        {item.canRetry && onRetry ? <button className="rounded border border-indigo-400 px-3 py-2 text-sm text-indigo-700" onClick={() => onRetry(item.id)}>ลองใหม่</button> : null}
      </div>
    </div>
  );
}
