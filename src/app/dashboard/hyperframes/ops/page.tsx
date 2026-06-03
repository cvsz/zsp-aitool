"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HyperFramesStatusGrid } from "@/components/hyperframes/HyperFramesStatusGrid";
import { OperatorWarningBanner } from "@/components/hyperframes/OperatorWarningBanner";

type OpsStatus = { pending: number; running: number; staleRunning: number; completedLast24h: number; failedLast24h: number; renderEnabled: boolean; maxPendingJobs: number; maxRunningJobs: number; diskFreeMb: number | null; serviceActive: boolean | null; serviceEnabled: boolean | null };

export default function HyperFramesOpsPage() {
  const [status, setStatus] = useState<OpsStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/hyperframes/render/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => body?.ok ? setStatus(body.data as OpsStatus) : setErrorMessage(body?.error?.message ?? "ไม่สามารถโหลดสถานะ"))
      .catch(() => setErrorMessage("ไม่สามารถโหลดสถานะ"));
  }, []);

  const warnings = useMemo(() => {
    if (!status) return ["UI นี้เป็น read-only/safe ไม่มีการควบคุม systemd โดยตรง"];
    const items: string[] = ["UI นี้เป็น read-only/safe ไม่มีการควบคุม systemd โดยตรง"];
    if (!status.renderEnabled) items.push("ระบบเรนเดอร์ถูกปิดตามนโยบายความปลอดภัย");
    if (status.pending >= status.maxPendingJobs) items.push("คิว pending แตะเพดาน");
    if (status.running >= status.maxRunningJobs) items.push("คิว running แตะเพดาน");
    if (status.staleRunning > 0) items.push(`พบ stale running ${status.staleRunning} งาน`);
    if (status.diskFreeMb !== null && status.diskFreeMb < 2048) items.push("พื้นที่ดิสก์ต่ำกว่า 2GB");
    return items;
  }, [status]);

  const cards = status ? [
    { label: "Pending", value: String(status.pending), tone: status.pending >= status.maxPendingJobs ? "danger" as const : "info" as const, hint: `limit ${status.maxPendingJobs}` },
    { label: "Running", value: String(status.running), tone: status.running >= status.maxRunningJobs ? "warning" as const : "success" as const, hint: `limit ${status.maxRunningJobs}` },
    { label: "Stale Running", value: String(status.staleRunning), tone: status.staleRunning > 0 ? "danger" as const : "success" as const },
    { label: "Completed 24h", value: String(status.completedLast24h), tone: "success" as const },
    { label: "Failed 24h", value: String(status.failedLast24h), tone: status.failedLast24h > 0 ? "warning" as const : "success" as const },
    { label: "Free Disk (MB)", value: status.diskFreeMb === null ? "n/a" : String(status.diskFreeMb), tone: status.diskFreeMb !== null && status.diskFreeMb < 2048 ? "danger" as const : "info" as const },
    { label: "Worker Status", value: status.serviceActive === null ? "unknown" : status.serviceActive ? "active" : "inactive", tone: status.serviceActive ? "success" as const : "warning" as const },
    { label: "Service Enabled", value: status.serviceEnabled === null ? "unknown" : status.serviceEnabled ? "enabled" : "disabled", tone: status.serviceEnabled ? "success" as const : "info" as const },
  ] : [];

  return (
    <main className="space-y-6">
      <header className="cyber-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">HyperFrames Operator</p>
        <h1 className="mt-2 text-3xl font-bold text-white">HyperFrames Ops</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">ตรวจสอบสุขภาพคิว, worker, watchdog และ disk อย่างปลอดภัย หน้าเว็บนี้ไม่สั่ง start/stop/enable/disable systemd</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard/hyperframes/ops/queue" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">ดู Operator Queue</Link>
          <Link href="/dashboard/hyperframes/renders" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300">ประวัติเรนเดอร์</Link>
        </div>
      </header>
      {errorMessage ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{errorMessage}</p> : null}
      {status ? <HyperFramesStatusGrid cards={cards} /> : <div className="rounded-2xl border border-dashed border-white/10 bg-cyber-surface p-6 text-sm text-slate-500">กำลังโหลดสถานะ operator...</div>}
      <OperatorWarningBanner items={warnings} />
      <section className="cyber-card p-5 shadow-sm">
        <h2 className="text-lg font-bold text-white">แนวทางปฏิบัติ</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-400"><b className="text-white">Monitor</b><br />ดู pending/running/stale และ disk ก่อนเปิด real render เพิ่ม</div>
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-400"><b className="text-white">Recover</b><br />ใช้ CLI ที่มี confirmation gate สำหรับ stale jobs เท่านั้น</div>
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-400"><b className="text-white">Rollback</b><br />ควบคุม systemd บน production VM ผ่านคำสั่ง operator ไม่ใช่ UI</div>
        </div>
      </section>
    </main>
  );
}
