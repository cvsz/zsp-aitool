"use client";

import { useEffect, useMemo, useState } from "react";
import { RenderHistoryTable } from "@/components/hyperframes/RenderHistoryTable";
import type { RenderHistoryItem } from "@/components/hyperframes/RenderJobCard";

export default function HyperFramesRenderHistoryPage() {
  const [items, setItems] = useState<RenderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/hyperframes/render/history?limit=20", { cache: "no-store" });
    const body = await res.json();
    setItems(body.data?.items ?? []);
    setLoading(false);
  }

  async function cancel(id: string) {
    await fetch(`/api/hyperframes/render/${id}/cancel`, { method: "POST" });
    await load();
  }

  useEffect(() => { load(); }, []);
  const shouldPoll = useMemo(() => items.some((x) => x.status === "PENDING" || x.status === "RUNNING"), [items]);
  useEffect(() => { if (!shouldPoll) return; const t = setInterval(() => { void load(); }, 12000); return () => clearInterval(t); }, [shouldPoll]);

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">ประวัติเรนเดอร์ HyperFrames</h1><p className="text-sm text-slate-600">แสดงเฉพาะงานของบัญชีคุณ พร้อมปุ่มดาวน์โหลด/ยกเลิกที่ปลอดภัย</p>{loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : <RenderHistoryTable items={items} onCancel={cancel} />}</main>;
}
