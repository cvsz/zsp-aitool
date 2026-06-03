"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HyperFramesStatusGrid } from "@/components/hyperframes/HyperFramesStatusGrid";
import { OperatorWarningBanner } from "@/components/hyperframes/OperatorWarningBanner";

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

  const parsedRows = useMemo(() => rowsText.split("\n").map((line) => line.trim()).filter(Boolean), [rowsText]);
  const stats = useMemo(() => [
    { label: "Rows", value: String(parsedRows.length), tone: "info" as const, hint: "จำนวนรายการที่เตรียม enqueue" },
    { label: "Queued", value: String(results.filter((item) => item.status === "queued").length), tone: "success" as const },
    { label: "Skipped", value: String(results.filter((item) => item.status === "skipped").length), tone: "warning" as const },
    { label: "Invalid", value: String(results.filter((item) => item.status === "failed_validation").length), tone: "danger" as const },
  ], [parsedRows.length, results]);

  async function onSubmit() {
    setLoading(true);
    const items: BatchRow[] = parsedRows.map((line) => {
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
    <main className="space-y-6">
      <header className="cyber-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">HyperFrames Batch</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Batch Render HyperFrames</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">นำรายการสินค้าเข้า queue หลายรายการแบบมี guardrails: limit, validation, quota และการติดตามผลผ่าน render history</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link className="rounded-full bg-slate-950 px-4 py-2 font-semibold text-white" href="/dashboard/hyperframes/renders">ดูประวัติเรนเดอร์</Link>
          <Link className="rounded-full border border-white/10 px-4 py-2 font-semibold text-slate-300" href="/dashboard/hyperframes/ops">ตรวจสถานะคิว</Link>
        </div>
      </header>

      <OperatorWarningBanner items={["ระบบอาจ skip รายการเมื่อเกินคิวหรือโควต้า", "ควรตรวจ productId และ duration ก่อน enqueue", "ทุกผลลัพธ์ต้องติดตามผ่าน secure render history API"]} />
      <HyperFramesStatusGrid cards={stats} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="cyber-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">รายการ Batch</h2>
            <p className="mt-1 text-sm text-slate-500">รูปแบบต่อบรรทัด: productId,platform,aspectRatio,durationSeconds</p>
          </div>
          <textarea className="min-h-56 w-full rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-sm outline-none focus:border-cyber-cyan/50 focus:ring-4 focus:ring-cyber-cyan/30" value={rowsText} onChange={(e) => setRowsText(e.target.value)} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" disabled={loading || parsedRows.length === 0} onClick={onSubmit}>
              {loading ? "กำลัง enqueue..." : "เริ่ม Batch Render"}
            </button>
            <p className="text-sm text-slate-500">ระบบจะ validate ทีละรายการและไม่แสดง path ภายใน</p>
          </div>
        </div>

        <aside className="cyber-card p-5 shadow-sm">
          <h2 className="text-lg font-bold text-white">ผลลัพธ์รายรายการ</h2>
          {!results.length ? <p className="mt-3 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">ยังไม่มีผลลัพธ์</p> : null}
          <div className="mt-3 space-y-3">
            {results.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-100">{item.productId}</p>
                  <span className="rounded-full bg-cyber-surface px-2 py-1 text-xs font-semibold text-slate-300">{item.status}</span>
                </div>
                {item.jobId ? <Link className="mt-2 inline-block text-cyber-cyan underline" href="/dashboard/hyperframes/renders">ไปหน้าประวัติเรนเดอร์</Link> : null}
                {item.reason ? <p className="mt-2 text-slate-400">เหตุผล: {item.reason}</p> : null}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
