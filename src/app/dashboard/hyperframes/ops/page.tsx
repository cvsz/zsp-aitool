"use client";

import { useEffect, useMemo, useState } from "react";

type OpsStatus = {
  pending: number;
  running: number;
  completedLast24h: number;
  failedLast24h: number;
  oldestPendingCreatedAt: string | null;
  renderEnabled: boolean;
  maxPendingJobs: number;
  maxRunningJobs: number;
  diskFreeMb: number | null;
};

export default function HyperFramesOpsPage() {
  const [status, setStatus] = useState<OpsStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/hyperframes/render/status")
      .then((res) => res.json().then((body) => ({ status: res.status, body })))
      .then(({ status, body }) => {
        if (status >= 400 || !body?.ok) {
          setErrorMessage(body?.error?.message ?? "ไม่สามารถโหลดสถานะการเรนเดอร์ได้");
          return;
        }
        setStatus(body.data as OpsStatus);
      })
      .catch(() => setErrorMessage("ไม่สามารถโหลดสถานะการเรนเดอร์ได้"));
  }, []);

  const warnings = useMemo(() => {
    if (!status) return [] as string[];
    const items: string[] = [];
    if (!status.renderEnabled) items.push("Render ถูกปิดอยู่ตามค่าเริ่มต้นปลอดภัย");
    if (status.pending >= status.maxPendingJobs) items.push("คิว Pending แตะเพดานแล้ว");
    if (status.running >= status.maxRunningJobs) items.push("มีงาน Running เต็มเพดาน");
    if (status.failedLast24h > 0) items.push(`พบงานล้มเหลว ${status.failedLast24h} งานใน 24 ชั่วโมงล่าสุด`);
    if (status.diskFreeMb !== null && status.diskFreeMb < 2048) items.push(`พื้นที่ว่างต่ำ (${status.diskFreeMb} MB)`);
    return items;
  }, [status]);

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">HyperFrames Operator Dashboard</h1>
      <p className="text-slate-600">แสดงสถานะ queue สำหรับผู้ดูแลระบบเท่านั้น (ไม่มีปุ่มสั่ง start/stop worker)</p>
      {errorMessage ? <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{errorMessage}</p> : null}
      {status ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Stat label="Pending" value={String(status.pending)} />
          <Stat label="Running" value={String(status.running)} />
          <Stat label="Completed (24h)" value={String(status.completedLast24h)} />
          <Stat label="Failed (24h)" value={String(status.failedLast24h)} />
          <Stat label="Render Enabled" value={status.renderEnabled ? "true" : "false"} />
          <Stat label="Disk Free (MB)" value={status.diskFreeMb === null ? "n/a" : String(status.diskFreeMb)} />
          <Stat label="Oldest Pending" value={status.oldestPendingCreatedAt ?? "-"} />
        </div>
      ) : null}
      {warnings.length > 0 ? (
        <div className="rounded border border-red-200 bg-red-50 p-3">
          <h2 className="font-semibold text-red-700">Warnings</h2>
          <ul className="list-disc pl-5 text-sm text-red-700">
            {warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
