"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HyperFramesStatusGrid } from "@/components/hyperframes/HyperFramesStatusGrid";
import { OperatorWarningBanner } from "@/components/hyperframes/OperatorWarningBanner";

type OpsStatus = { pending: number; running: number; staleRunning: number; completedLast24h: number; failedLast24h: number; renderEnabled: boolean; maxPendingJobs: number; maxRunningJobs: number; diskFreeMb: number | null; serviceActive: boolean | null; serviceEnabled: boolean | null };

export default function HyperFramesOpsPage() {
  const [status, setStatus] = useState<OpsStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => { fetch("/api/hyperframes/render/status").then((res) => res.json()).then((body) => body?.ok ? setStatus(body.data as OpsStatus) : setErrorMessage(body?.error?.message ?? "ไม่สามารถโหลดสถานะ")).catch(() => setErrorMessage("ไม่สามารถโหลดสถานะ")); }, []);

  const warnings = useMemo(() => {
    if (!status) return [] as string[];
    const items: string[] = ["UI นี้เป็น read-only/safe ไม่มีการควบคุม systemd โดยตรง"];
    if (!status.renderEnabled) items.push("ระบบเรนเดอร์ถูกปิดตามนโยบายความปลอดภัย");
    if (status.pending >= status.maxPendingJobs) items.push("คิว pending แตะเพดาน");
    if (status.running >= status.maxRunningJobs) items.push("คิว running แตะเพดาน");
    if (status.staleRunning > 0) items.push(`พบ stale running ${status.staleRunning} งาน`);
    if (status.diskFreeMb !== null && status.diskFreeMb < 2048) items.push("พื้นที่ดิสก์ต่ำกว่า 2GB");
    return items;
  }, [status]);

  const cards = status ? [
    { label: "Pending", value: String(status.pending) },
    { label: "Running", value: String(status.running) },
    { label: "Stale Running", value: String(status.staleRunning) },
    { label: "Completed 24h", value: String(status.completedLast24h) },
    { label: "Failed 24h", value: String(status.failedLast24h) },
    { label: "Free Disk (MB)", value: status.diskFreeMb === null ? "n/a" : String(status.diskFreeMb) },
    { label: "Worker Status", value: status.serviceActive === null ? "unknown" : status.serviceActive ? "active" : "inactive" },
    { label: "Watchdog/Enable", value: status.serviceEnabled === null ? "unknown" : status.serviceEnabled ? "enabled" : "disabled" },
  ] : [];

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">HyperFrames Ops</h1><p className="text-sm text-slate-600">สำหรับ operator/admin เพื่อตรวจสอบสุขภาพคิวอย่างปลอดภัย</p><div className="text-sm"><Link href="/dashboard/hyperframes/ops/queue" className="text-indigo-700 underline">ดู Operator Queue</Link></div>{errorMessage ? <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{errorMessage}</p> : null}{status ? <HyperFramesStatusGrid cards={cards} /> : null}<OperatorWarningBanner items={warnings} /></main>;
}
