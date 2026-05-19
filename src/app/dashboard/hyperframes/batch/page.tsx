"use client";

import Link from "next/link";
import { useState } from "react";

type BatchRow = {
  productId: string;
  platform: "facebook" | "instagram" | "tiktok" | "youtube";
  aspectRatio: "9:16" | "1:1" | "16:9";
  durationSeconds: number;
  caption?: string;
};

type Result = {
  productId: string;
  status: "queued" | "skipped" | "failed_validation";
  jobId?: string;
  reason?: string;
};

export default function HyperFramesBatchPage() {
  const [rowsText, setRowsText] = useState("p1,facebook,9:16,12\np2,instagram,1:1,10");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  async function onSubmit() {
    setLoading(true);
    const items: BatchRow[] = rowsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [productId, platform, aspectRatio, durationSeconds] = line.split(",").map((x) => x.trim());
        return { productId, platform: platform as BatchRow["platform"], aspectRatio: aspectRatio as BatchRow["aspectRatio"], durationSeconds: Number(durationSeconds) };
      });

    const res = await fetch("/api/hyperframes/render/batch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const body = await res.json();
    setResults(body.data?.results ?? []);
    setLoading(false);
  }

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Batch Render HyperFrames</h1>
      <p className="text-sm text-slate-600">ขั้นตอน: ใส่รายการ → ตรวจสอบ limit → enqueue คิว → ติดตามในหน้าประวัติ</p>
      <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">ความปลอดภัยคิว: ระบบมีเพดาน pending/running และอาจข้ามบางรายการเมื่อเกินโควต้า</div>

      <textarea className="min-h-44 w-full rounded-md border p-3 font-mono text-sm" value={rowsText} onChange={(e) => setRowsText(e.target.value)} />
      <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={loading} onClick={onSubmit}>
        {loading ? "กำลัง enqueue..." : "เริ่ม Batch Render"}
      </button>

      <section className="space-y-2">
        <h2 className="font-semibold">ผลลัพธ์รายรายการ</h2>
        {!results.length ? <p className="text-sm text-slate-500">ยังไม่มีผลลัพธ์</p> : null}
        {results.map((item, idx) => (
          <div key={`${item.productId}-${idx}`} className="rounded border p-3 text-sm">
            <div>Product: {item.productId}</div>
            <div>Status: {item.status}</div>
            {item.jobId ? <Link className="text-blue-700 underline" href="/dashboard/hyperframes/renders">ไปหน้าประวัติเรนเดอร์ (job: {item.jobId})</Link> : null}
            {item.reason ? <div className="text-slate-600">เหตุผล: {item.reason}</div> : null}
          </div>
        ))}
      </section>
    </main>
  );
}
