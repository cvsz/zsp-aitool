"use client";
import { useEffect, useMemo, useState } from "react";
import { HyperFramesStatusGrid } from "@/components/hyperframes/HyperFramesStatusGrid";
import { OperatorWarningBanner } from "@/components/hyperframes/OperatorWarningBanner";

type QueueStatus = { pending: number; running: number; failedLast24h: number; staleRunning: number; serviceActive: boolean | null; diskFreeMb: number | null; completedLast24h?: number };

export default function HyperFramesOpsQueuePage() {
  const [status, setStatus] = useState<QueueStatus | null>(null); const [error, setError] = useState("");
  useEffect(() => { fetch("/api/hyperframes/operator/queue").then(async (res) => ({ status: res.status, body: await res.json() })).then(({ status, body }) => status >= 400 || !body?.ok ? setError(body?.error?.message ?? "ไม่สามารถโหลด") : setStatus(body.data as QueueStatus)).catch(() => setError("ไม่สามารถโหลด")); }, []);
  const warning = useMemo(() => !status ? [] : ["ไม่มี systemctl controls ใน UI", status.staleRunning > 0 ? `พบ stale running ${status.staleRunning} งาน` : "ไม่พบ stale running"], [status]);
  const cards = !status ? [] : [{ label: "Pending", value: String(status.pending) }, { label: "Running", value: String(status.running) }, { label: "Stale Running", value: String(status.staleRunning) }, { label: "Completed 24h", value: String(status.completedLast24h ?? 0) }, { label: "Failed 24h", value: String(status.failedLast24h) }, { label: "Free Disk (MB)", value: status.diskFreeMb === null ? "n/a" : String(status.diskFreeMb) }];
  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">Operator Queue Monitor</h1><p className="text-sm text-slate-600">หน้าตรวจสอบคิวแบบ read-only ปลอดภัย</p>{error ? <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{error}</p> : null}{status ? <HyperFramesStatusGrid cards={cards} /> : null}<OperatorWarningBanner items={warning} /></main>;
}
