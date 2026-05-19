"use client";

import { useEffect, useState } from "react";
import { RenderJobCard, type RenderHistoryItem } from "@/components/hyperframes/RenderJobCard";

type HistoryResponse = { ok: boolean; data?: { items: RenderHistoryItem[]; pageInfo: { hasMore: boolean; nextCursor: string | null }; scope?: { orgId: string | null; role: string | null } }; error?: { message: string } };

export default function HyperFramesRendersPage() {
  const [items, setItems] = useState<RenderHistoryItem[]>([]);
  const [orgId, setOrgId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (orgId.trim()) params.set("orgId", orgId.trim());
    const res = await fetch(`/api/hyperframes/render/history${params.size ? `?${params}` : ""}`, { cache: "no-store" });
    const data = (await res.json()) as HistoryResponse;
    if (!data.ok) setError(data.error?.message ?? "โหลดประวัติไม่สำเร็จ");
    else setItems(data.data?.items ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function mutate(id: string, action: "cancel" | "retry") {
    const params = orgId.trim() ? `?orgId=${encodeURIComponent(orgId.trim())}` : "";
    const res = await fetch(`/api/hyperframes/render/${id}/${action}${params}`, { method: "POST" });
    const data = await res.json();
    if (!data.ok) setError(data.error?.message ?? "ทำรายการไม่สำเร็จ");
    await load();
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">ประวัติ HyperFrames renders</h1>
        <p className="text-sm text-slate-600">ดูประวัติงานส่วนตัว หรือกรอก Org ID เพื่อดูประวัติที่แชร์ในทีมตามสิทธิ์สมาชิก</p>
      </header>
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-medium text-slate-700">Org ID (ไม่บังคับ)<input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={orgId} onChange={(event) => setOrgId(event.target.value)} placeholder="org_xxx" /></label>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => void load()}>โหลดประวัติ</button>
      </section>
      {error ? <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
      {loading ? <div className="rounded border border-slate-200 p-4 text-sm text-slate-600">กำลังโหลด...</div> : null}
      {!loading && items.length === 0 ? <div className="rounded border border-slate-200 p-4 text-sm text-slate-600">ยังไม่มีงานเรนเดอร์</div> : null}
      <section className="grid gap-4">
        {items.map((item) => <RenderJobCard key={item.id} item={item} onCancel={(id) => void mutate(id, "cancel")} onRetry={(id) => void mutate(id, "retry")} />)}
      </section>
    </main>
  );
}
