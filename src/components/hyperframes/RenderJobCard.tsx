import Image from "next/image";
import type { RenderJobStatus } from "@prisma/client";
import { RenderStatusBadge } from "@/components/hyperframes/RenderStatusBadge";
import { SafeErrorText } from "@/components/hyperframes/SafeErrorText";

export type RenderHistoryItem = { id: string; status: string; attempts: number; durationSeconds: number | null; width?: number | null; height?: number | null; createdAt: string | Date; startedAt?: string | Date | null; completedAt?: string | Date | null; failedAt?: string | Date | null; errorMessage?: string | null; downloadUrl?: string | null; thumbnailUrl?: string | null; canDownload?: boolean; canCancel?: boolean; canRetry?: boolean; metadata?: { platform?: string; aspectRatio?: string } | null };

const actionClass = "rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1";

export function RenderJobCard({ item, onCancel, onRetry }: { item: RenderHistoryItem; onCancel: (id: string) => void; onRetry?: (id: string) => void }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RenderStatusBadge status={item.status as RenderJobStatus} />
        <span className="text-xs font-medium text-slate-500">#{item.id.slice(0, 8)} • พยายาม {item.attempts} ครั้ง</span>
      </div>
      <div className="mt-3 grid gap-1 text-sm text-slate-700">
        <div>สร้างเมื่อ: {new Date(item.createdAt).toLocaleString("th-TH")}</div>
        {item.startedAt ? <div>เริ่มเรนเดอร์: {new Date(item.startedAt).toLocaleString("th-TH")}</div> : null}
        {item.completedAt ? <div>เสร็จสิ้น: {new Date(item.completedAt).toLocaleString("th-TH")}</div> : null}
        {item.failedAt ? <div>ล้มเหลว: {new Date(item.failedAt).toLocaleString("th-TH")}</div> : null}
        <div>ระยะเวลา: {item.durationSeconds ?? "-"} วินาที</div>
        <div>แพลตฟอร์ม: {item.metadata?.platform ?? "-"} • สัดส่วน: {item.metadata?.aspectRatio ?? "-"}</div>
        <div className="text-xs text-slate-500">สิทธิ์การดำเนินการ: ดาวน์โหลด {String(Boolean(item.canDownload))} · ยกเลิก {String(Boolean(item.canCancel))} · ลองใหม่ {String(Boolean(item.canRetry))}</div>
        {item.errorMessage ? <div className="text-rose-700">ข้อผิดพลาด: <SafeErrorText message={item.errorMessage} /></div> : null}
      </div>
      {item.thumbnailUrl ? <Image src={item.thumbnailUrl} alt="ตัวอย่างภาพเรนเดอร์" width={240} height={136} className="mt-3 h-28 w-auto rounded-xl border border-slate-200 object-cover" unoptimized /> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {item.canDownload && item.downloadUrl ? <a className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1" href={item.downloadUrl}>ดาวน์โหลด (ผ่าน API ปลอดภัย)</a> : null}
        {item.canCancel ? <button className={actionClass} onClick={() => onCancel(item.id)}>ยกเลิกงาน (เฉพาะงานที่ยังไม่จบ)</button> : null}
        {item.canRetry && onRetry ? <button className={actionClass} onClick={() => onRetry(item.id)}>ลองใหม่ (ยังคง guardrails เดิม)</button> : null}
      </div>
    </article>
  );
}
