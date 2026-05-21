"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type CsvImportJobStatus = "PENDING" | "RUNNING" | "CANCEL_REQUESTED" | "CANCELLED" | "COMPLETED" | "FAILED";
type CsvImportJob = { id: string; sourceFileName: string; status: CsvImportJobStatus; totalRows: number | null; processedRows: number; importedRows: number; rejectedRows: number; failedRows: number; totalBytes: string | number | null; processedBytes: string | number | null; rejectedReasons: unknown; startedAt: string | null; completedAt: string | null; cancelledAt: string | null; };

const ACTIVE_STATUSES: CsvImportJobStatus[] = ["PENDING", "RUNNING", "CANCEL_REQUESTED"];

function statusLabel(status: CsvImportJobStatus) {
  const labels: Record<CsvImportJobStatus, string> = { PENDING: "รอคิว", RUNNING: "กำลังนำเข้า", CANCEL_REQUESTED: "กำลังยกเลิก", CANCELLED: "ยกเลิกแล้ว", COMPLETED: "เสร็จสิ้น", FAILED: "ล้มเหลว" };
  return labels[status];
}

function asNumber(value: string | number | null): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function progressPercent(job: CsvImportJob): number | null {
  if (job.totalRows && job.totalRows > 0) return Math.min(100, Math.round((job.processedRows / job.totalRows) * 100));
  const totalBytes = asNumber(job.totalBytes);
  const processedBytes = asNumber(job.processedBytes);
  if (totalBytes && totalBytes > 0 && processedBytes !== null) return Math.min(100, Math.round((processedBytes / totalBytes) * 100));
  return null;
}

export function CsvProductImportProgressPanel() {
  const [jobs, setJobs] = useState<CsvImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const hasActiveJobs = useMemo(() => jobs.some((job) => ACTIVE_STATUSES.includes(job.status)), [jobs]);

  const refresh = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/imports/csv-products", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json?.ok || !Array.isArray(json?.data)) {
      setError(json?.error?.message ?? "ไม่สามารถโหลดงานนำเข้า CSV ได้");
      return;
    }
    setJobs(json.data);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh();
    }, hasActiveJobs ? 7000 : 25000);
    return () => window.clearInterval(id);
  }, [hasActiveJobs, refresh]);

  async function runAction(jobId: string, action: "cancel" | "retry") {
    setBusyId(jobId);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/imports/csv-products/${jobId}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "ดำเนินการไม่สำเร็จ");
        return;
      }
      setMessage(action === "cancel" ? "ส่งคำขอยกเลิกแล้ว" : "สร้างงานลองใหม่แล้ว");
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="csv-import-progress-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">ความคืบหน้านำเข้า CSV</h2>
          <p className="text-sm text-slate-600">ติดตามงานล่าสุด, สถานะ, จำนวนที่นำเข้า/ปฏิเสธ และการยกเลิก/ลองใหม่</p>
        </div>
        <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => void refresh()}>รีเฟรช</button>
      </div>

      {loading ? <p className="text-sm text-slate-600">กำลังโหลดสถานะการนำเข้า...</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      {!loading && !error && jobs.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-600">ยังไม่มีงานนำเข้า CSV</p> : null}

      <div className="mt-3 space-y-3">
        {jobs.map((job) => {
          const progress = progressPercent(job);
          const reasons = Array.isArray(job.rejectedReasons) ? job.rejectedReasons.slice(0, 3).map((item) => String(item)) : [];
          const canCancel = job.status === "PENDING" || job.status === "RUNNING";
          const canRetry = job.status === "FAILED" || job.status === "CANCELLED";

          return (
            <article key={job.id} className="rounded-xl border border-slate-200 p-4">
              <p className="truncate text-sm font-semibold text-slate-950">ไฟล์: {job.sourceFileName}</p>
              <p className="mt-1 text-xs text-slate-600">สถานะ: {statusLabel(job.status)}</p>
              <p className="mt-2 text-xs text-slate-600">processed {job.processedRows} · imported {job.importedRows} · rejected {job.rejectedRows} · failed {job.failedRows}</p>
              <p className="mt-1 text-xs text-slate-500">started {job.startedAt ?? "-"} · completed {job.completedAt ?? "-"} · cancelled {job.cancelledAt ?? "-"}</p>
              {progress !== null ? <p className="mt-1 text-xs text-orange-700">ความคืบหน้า {progress}%</p> : null}
              {reasons.length > 0 ? <p className="mt-1 text-xs text-red-700">เหตุผลที่ถูกปฏิเสธ: {reasons.join(" | ")}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button disabled={!canCancel || busyId === job.id} onClick={() => void runAction(job.id, "cancel")} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">ยกเลิก</button>
                <button disabled={!canRetry || busyId === job.id} onClick={() => void runAction(job.id, "retry")} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">ลองใหม่</button>
                <Link href="/dashboard/products" className="rounded-lg border px-3 py-1.5 text-xs">ดูสินค้าที่นำเข้า</Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
