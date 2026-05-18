"use client";

import { useEffect, useMemo, useState } from "react";
import { RenderHistoryTable } from "@/components/hyperframes/RenderHistoryTable";
import type { RenderHistoryItem } from "@/components/hyperframes/RenderJobCard";

type QuotaState = { plan: string; usage: number; remaining: number; limits: { monthlyRenders: number; maxDurationSeconds: number; maxConcurrentJobs: number; maxOutputSizeMb: number } };

export default function HyperFramesRenderHistoryPage() {
  const [items, setItems] = useState<RenderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [historyRes, quotaRes] = await Promise.all([
      fetch("/api/hyperframes/render/history?limit=20", { cache: "no-store" }),
      fetch("/api/hyperframes/render/quota", { cache: "no-store" })
    ]);
    const body = await historyRes.json();
    const quotaBody = await quotaRes.json();
    setItems(body.data?.items ?? []);
    setQuota(quotaBody.data ?? null);
    setLoading(false);
  }

  async function cancel(id: string) {
    await fetch(`/api/hyperframes/render/${id}/cancel`, { method: "POST" });
    await load();
  }

  async function retry(id: string) {
    const res = await fetch(`/api/hyperframes/render/${id}/retry`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json();
      setError(body?.error?.message ?? "ลองใหม่ไม่สำเร็จ");
      return;
    }
    setError(null);
    await load();
  }

  useEffect(() => { load(); }, []);
  const shouldPoll = useMemo(() => items.some((x) => x.status === "PENDING" || x.status === "RUNNING"), [items]);
  useEffect(() => { if (!shouldPoll) return; const t = setInterval(() => { void load(); }, 12000); return () => clearInterval(t); }, [shouldPoll]);

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">ประวัติเรนเดอร์ HyperFrames</h1><p className="text-sm text-slate-600">แสดงเฉพาะงานของบัญชีคุณ พร้อมปุ่มดาวน์โหลด/ยกเลิก/ลองใหม่ที่ปลอดภัย</p>{quota ? <div className="rounded border bg-slate-50 p-3 text-sm text-slate-700">แพ็กเกจ <b>{quota.plan.toUpperCase()}</b> • ใช้แล้ว {quota.usage}/{quota.limits.monthlyRenders} ครั้งเดือนนี้ • เหลือ {quota.remaining} ครั้ง • ความยาวสูงสุด {quota.limits.maxDurationSeconds} วินาที • รันพร้อมกันสูงสุด {quota.limits.maxConcurrentJobs} งาน • ขนาดไฟล์สูงสุด {quota.limits.maxOutputSizeMb}MB</div> : null}{error ? <div className="rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}{loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : <RenderHistoryTable items={items} onCancel={cancel} onRetry={retry} />}</main>;
}
