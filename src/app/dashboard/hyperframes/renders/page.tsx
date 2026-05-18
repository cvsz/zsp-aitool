"use client";

import { useEffect, useMemo, useState } from "react";
import { RenderHistoryTable } from "@/components/hyperframes/RenderHistoryTable";
import type { RenderHistoryItem } from "@/components/hyperframes/RenderJobCard";

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

  async function load() {
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

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">ประวัติเรนเดอร์ HyperFrames</h1><p className="text-sm text-slate-600">แสดงเฉพาะงานของบัญชีคุณ พร้อมปุ่มดาวน์โหลด/ยกเลิกที่ปลอดภัย</p>{quota ? <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700"><div>โควต้ารายเดือนคงเหลือ: <span className="font-semibold">{quota.remainingMonthlyRenders}</span></div><div>พื้นที่ใช้งาน: <span className="font-semibold">{quota.storageUsedMb}</span> / {quota.storageQuotaMb} MB</div><div>ลบไฟล์อัตโนมัติหลัง: <span className="font-semibold">{quota.retentionDays}</span> วัน</div></section> : null}{loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : <RenderHistoryTable items={items} onCancel={cancel} />}</main>;
}
