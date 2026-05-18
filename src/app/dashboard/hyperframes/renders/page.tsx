"use client";

import { useEffect, useMemo, useState } from "react";
import { RenderHistoryTable } from "@/components/hyperframes/RenderHistoryTable";
import type { RenderHistoryItem } from "@/components/hyperframes/RenderJobCard";

type LimitState = { plan: string; limits: { monthlyRenders: number; maxDurationSeconds: number; maxConcurrentJobs: number; maxOutputSizeMb: number }; usage: { monthlyRendersUsed: number; runningJobs: number } } | null;

export default function HyperFramesRenderHistoryPage() {
  const [items, setItems] = useState<RenderHistoryItem[]>([]);
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

  useEffect(() => { load(); }, []);
  const shouldPoll = useMemo(() => items.some((x) => x.status === "PENDING" || x.status === "RUNNING"), [items]);
  useEffect(() => { if (!shouldPoll) return; const t = setInterval(() => { void load(); }, 12000); return () => clearInterval(t); }, [shouldPoll]);

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">ประวัติเรนเดอร์ HyperFrames</h1><p className="text-sm text-slate-600">แสดงเฉพาะงานของบัญชีคุณ พร้อมปุ่มดาวน์โหลด/ยกเลิกที่ปลอดภัย</p>{limits ? <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">แพ็กเกจ: <b>{limits.plan.toLowerCase()}</b> • ใช้ไป {limits.usage.monthlyRendersUsed}/{limits.limits.monthlyRenders} งาน/เดือน • กำลังรัน {limits.usage.runningJobs}/{limits.limits.maxConcurrentJobs} งาน • ความยาวสูงสุด {limits.limits.maxDurationSeconds}s • ไฟล์สูงสุด {limits.limits.maxOutputSizeMb}MB</div> : null}{loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : <RenderHistoryTable items={items} onCancel={cancel} onRetry={retry} />}</main>;
}
