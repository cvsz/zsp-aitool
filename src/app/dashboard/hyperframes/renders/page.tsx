"use client";

import { useEffect, useMemo, useState } from "react";
import { RenderHistoryTable } from "@/components/hyperframes/RenderHistoryTable";
import type { RenderHistoryItem } from "@/components/hyperframes/RenderJobCard";

type LimitState = { plan: string; limits: { monthlyRenders: number; maxDurationSeconds: number; maxConcurrentJobs: number; maxOutputSizeMb: number }; usage: { monthlyRendersUsed: number; runningJobs: number } } | null;
type QuotaSummary = {
  remainingMonthlyRenders: number;
  storageUsedMb: number;
  storageQuotaMb: number;
  retentionDays: number;
};

export default function HyperFramesRenderHistoryPage() {
  const [items, setItems] = useState<RenderHistoryItem[]>([]);
  const [quota, setQuota] = useState<QuotaSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<LimitState>(null);

  async function load() {
    const [res, limitRes] = await Promise.all([
      fetch("/api/hyperframes/render/history?limit=20", { cache: "no-store" }),
      fetch("/api/hyperframes/render/limits", { cache: "no-store" })
    ]);
    const body = await res.json();
    const limitBody = await limitRes.json();
    setItems(body.data?.items ?? []);
    setLimits(limitBody.data ?? null);
    const [historyRes, quotaRes] = await Promise.all([
      fetch("/api/hyperframes/render/history?limit=20", { cache: "no-store" }),
      fetch("/api/hyperframes/quota", { cache: "no-store" }),
    ]);
    const historyBody = await historyRes.json();
    const quotaBody = await quotaRes.json();
    setItems(historyBody.data?.items ?? []);
    setQuota(quotaBody.data ?? null);
    setLoading(false);
  }

  async function cancel(id: string) {
    await fetch(`/api/hyperframes/render/${id}/cancel`, { method: "POST" });
    await load();
  }
  async function retry(id: string) {
    await fetch(`/api/hyperframes/render/${id}/retry`, { method: "POST" });
    await load();
  }

  async function retry(id: string) {
    await fetch(`/api/hyperframes/render/${id}/retry`, { method: "POST" });
    await load();
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    load();
  }, []);
  const shouldPoll = useMemo(() => items.some((x) => x.status === "PENDING" || x.status === "RUNNING"), [items]);
  useEffect(() => {
    if (!shouldPoll) return;
    const t = setInterval(() => {
      void load();
    }, 12000);
    return () => clearInterval(t);
  }, [shouldPoll]);

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">ประวัติเรนเดอร์ HyperFrames</h1><p className="text-sm text-slate-600">แสดงเฉพาะงานของบัญชีคุณ พร้อมปุ่มดาวน์โหลด/ยกเลิกที่ปลอดภัย</p><div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-medium">ฟีเจอร์เรนเดอร์ขั้นสูงต้องใช้แพ็กเกจแบบชำระเงิน</p><p className="mt-1">หากต้องการ High Quality, Batch Rendering, ความยาวมากกว่า 15 วินาที หรือเอาลายน้ำออก กรุณาอัปเกรดแพ็กเกจ</p><a className="mt-3 inline-flex rounded bg-amber-600 px-3 py-2 font-medium text-white" href="/dashboard/billing">อัปเกรดแพ็กเกจ</a></div>{loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : <RenderHistoryTable items={items} onCancel={cancel} />}</main>;
  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">ประวัติเรนเดอร์ HyperFrames</h1><p className="text-sm text-slate-600">แสดงเฉพาะงานของบัญชีคุณ พร้อมปุ่มดาวน์โหลด/ยกเลิกที่ปลอดภัย</p>{limits ? <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">แพ็กเกจ: <b>{limits.plan.toLowerCase()}</b> • ใช้ไป {limits.usage.monthlyRendersUsed}/{limits.limits.monthlyRenders} งาน/เดือน • กำลังรัน {limits.usage.runningJobs}/{limits.limits.maxConcurrentJobs} งาน • ความยาวสูงสุด {limits.limits.maxDurationSeconds}s • ไฟล์สูงสุด {limits.limits.maxOutputSizeMb}MB</div> : null}{loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : <RenderHistoryTable items={items} onCancel={cancel} onRetry={retry} />}</main>;
  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">ประวัติเรนเดอร์ HyperFrames</h1><p className="text-sm text-slate-600">แสดงเฉพาะงานของบัญชีคุณ พร้อมปุ่มดาวน์โหลด/ยกเลิกที่ปลอดภัย</p>{quota ? <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700"><div>โควต้ารายเดือนคงเหลือ: <span className="font-semibold">{quota.remainingMonthlyRenders}</span></div><div>พื้นที่ใช้งาน: <span className="font-semibold">{quota.storageUsedMb}</span> / {quota.storageQuotaMb} MB</div><div>ลบไฟล์อัตโนมัติหลัง: <span className="font-semibold">{quota.retentionDays}</span> วัน</div></section> : null}{loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : <RenderHistoryTable items={items} onCancel={cancel} />}</main>;
  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">ประวัติเรนเดอร์ HyperFrames</h1><p className="text-sm text-slate-600">แสดงเฉพาะงานของบัญชีคุณ พร้อมปุ่มดาวน์โหลด/ยกเลิกที่ปลอดภัย</p>{loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : <RenderHistoryTable items={items} onCancel={cancel} onRetry={retry} />}</main>;
}
