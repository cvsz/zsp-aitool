"use client";

import { useEffect, useState } from "react";

type QueueStatus = {
  pending: number;
  running: number;
  failedLast24h: number;
  staleRunning: number;
  serviceActive: boolean | null;
  diskFreeMb: number | null;
};

export default function HyperFramesOpsQueuePage() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hyperframes/operator/queue")
      .then(async (res) => ({ status: res.status, body: await res.json() }))
      .then(({ status, body }) => {
        if (status >= 400 || !body?.ok) {
          setError(body?.error?.message ?? "ไม่สามารถโหลดสถานะคิวได้");
          return;
        }
        setStatus(body.data as QueueStatus);
      })
      .catch(() => setError("ไม่สามารถโหลดสถานะคิวได้"));
  }, []);

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">Operator Queue Controls</h1><p className="text-sm text-slate-600">หน้าควบคุมคิวแบบปลอดภัยสำหรับ operator/admin</p>{error ? <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{error}</p> : null}{status ? <div className="grid gap-3 md:grid-cols-2"><Stat label="Pending" value={String(status.pending)} /><Stat label="Running" value={String(status.running)} /><Stat label="Failed (24h)" value={String(status.failedLast24h)} /><Stat label="Stale Running" value={String(status.staleRunning)} /><Stat label="Service Active" value={status.serviceActive === null ? "n/a" : String(status.serviceActive)} /><Stat label="Disk Free (MB)" value={status.diskFreeMb === null ? "n/a" : String(status.diskFreeMb)} /></div> : null}</main>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded border bg-white p-3"><div className="text-xs text-slate-500">{label}</div><div className="text-lg font-semibold">{value}</div></div>;
}
