"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HyperFramesStatusGrid } from "@/components/hyperframes/HyperFramesStatusGrid";
import { OperatorWarningBanner } from "@/components/hyperframes/OperatorWarningBanner";

type QueueStatus = { pending: number; running: number; failedLast24h: number; staleRunning: number; serviceActive: boolean | null; diskFreeMb: number | null; completedLast24h?: number };

export default function HyperFramesOpsQueuePage() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hyperframes/operator/queue", { cache: "no-store" })
      .then(async (res) => ({ status: res.status, body: await res.json() }))
      .then(({ status: httpStatus, body }) => httpStatus >= 400 || !body?.ok ? setError(body?.error?.message ?? "ไม่สามารถโหลด") : setStatus(body.data as QueueStatus))
      .catch(() => setError("ไม่สามารถโหลด"));
  }, []);

  const warnings = useMemo(() => !status ? ["ไม่มี systemctl controls ใน UI"] : ["ไม่มี systemctl controls ใน UI", status.staleRunning > 0 ? `พบ stale running ${status.staleRunning} งาน` : "ไม่พบ stale running", "การ recover/cleanup ต้องทำผ่าน operator script ที่มี confirmation gate"], [status]);
  const cards = !status ? [] : [
    { label: "Pending", value: String(status.pending), tone: status.pending > 0 ? "info" as const : "success" as const },
    { label: "Running", value: String(status.running), tone: status.running > 0 ? "warning" as const : "success" as const },
    { label: "Stale Running", value: String(status.staleRunning), tone: status.staleRunning > 0 ? "danger" as const : "success" as const },
    { label: "Completed 24h", value: String(status.completedLast24h ?? 0), tone: "success" as const },
    { label: "Failed 24h", value: String(status.failedLast24h), tone: status.failedLast24h > 0 ? "warning" as const : "success" as const },
    { label: "Free Disk (MB)", value: status.diskFreeMb === null ? "n/a" : String(status.diskFreeMb), tone: status.diskFreeMb !== null && status.diskFreeMb < 2048 ? "danger" as const : "info" as const },
  ];

  return (
    <main className="space-y-6">
      <header className="cyber-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Queue Monitor</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Operator Queue Monitor</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">อ่านสถานะคิวแบบปลอดภัย ไม่แสดงไฟล์ภายใน ไม่แสดง secrets และไม่มีปุ่มควบคุม daemon</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href="/dashboard/hyperframes/ops">กลับไป Ops</Link>
          <Link className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300" href="/dashboard/hyperframes/renders">ประวัติเรนเดอร์</Link>
        </div>
      </header>
      {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</p> : null}
      {status ? <HyperFramesStatusGrid cards={cards} /> : <div className="rounded-2xl border border-dashed border-white/10 bg-cyber-surface p-6 text-sm text-slate-500">กำลังโหลดคิว...</div>}
      <OperatorWarningBanner items={warnings} />
    </main>
  );
}
