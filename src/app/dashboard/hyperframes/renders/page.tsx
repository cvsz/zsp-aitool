"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RenderHistoryTable } from "@/components/hyperframes/RenderHistoryTable";
import { HyperFramesStatusGrid } from "@/components/hyperframes/HyperFramesStatusGrid";

type RenderHistoryItem = Parameters<typeof RenderHistoryTable>[0]["items"][number];
type HistoryResponse = { ok: boolean; data?: { items: RenderHistoryItem[]; pageInfo: { hasMore: boolean; nextCursor: string | null } }; error?: { message: string } };
const activeStatuses = new Set(["PENDING", "RUNNING"]);

export default function HyperFramesRendersPage() {
  const [items, setItems] = useState<RenderHistoryItem[]>([]);
  const [orgId, setOrgId] = useState("");
  const [status, setStatus] = useState("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams();
    if (orgId.trim()) params.set("orgId", orgId.trim());
    if (status !== "ALL") params.set("status", status);
    const res = await fetch(`/api/hyperframes/render/history${params.size ? `?${params}` : ""}`, { cache: "no-store" });
    const data = (await res.json()) as HistoryResponse;
    if (!data.ok) setError(data.error?.message ?? "โหลดประวัติไม่สำเร็จ"); else setItems(data.data?.items ?? []);
    setLoading(false);
  }, [orgId, status]);

  useEffect(() => { void load(); }, [load]);
  const hasActiveJobs = useMemo(() => items.some((item) => activeStatuses.has(item.status)), [items]);
  useEffect(() => {
    if (!hasActiveJobs) return;
    const timer = window.setInterval(() => void load(), 10000);
    return () => window.clearInterval(timer);
  }, [hasActiveJobs, load]);

  async function mutate(id: string, action: "cancel" | "retry") {
    if (action === "cancel" && !window.confirm("ยืนยันยกเลิกงานนี้ใช่หรือไม่?")) return;
    const params = orgId.trim() ? `?orgId=${encodeURIComponent(orgId.trim())}` : "";
    const res = await fetch(`/api/hyperframes/render/${id}/${action}${params}`, { method: "POST" });
    const data = await res.json();
    if (!data.ok) setError(data.error?.message ?? "ทำรายการไม่สำเร็จ");
    await load();
  }

  const stats = useMemo(() => [{ label: "งานทั้งหมด", value: String(items.length) }, { label: "กำลังรัน/รอคิว", value: String(items.filter((x) => activeStatuses.has(x.status)).length), hint: "เปิด polling อัตโนมัติเฉพาะเมื่อมีงาน active" }, { label: "สำเร็จ", value: String(items.filter((x) => x.status === "COMPLETED").length) }, { label: "ล้มเหลว", value: String(items.filter((x) => x.status === "FAILED").length) }], [items]);

  return <main className="mx-auto max-w-6xl space-y-6 p-6"><header className="cyber-card p-6 shadow-sm"><h1 className="text-2xl font-bold text-slate-100">ประวัติการเรนเดอร์ HyperFrames</h1><p className="mt-1 text-sm text-slate-400">ปลอดภัย: ไม่แสดง local path และดาวน์โหลดผ่าน API route เท่านั้น</p></header><HyperFramesStatusGrid cards={stats} /><section className="grid gap-2 rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 p-4 text-sm text-cyber-cyan"><p className="font-semibold">โควต้ารายเดือนคงเหลือ</p><p>ตรวจสอบโควต้าและพื้นที่จัดเก็บผ่าน /api/hyperframes/quota ก่อนสั่งเรนเดอร์เพิ่ม หากต้องการใช้งานมากขึ้นสามารถกดอัปเกรดแพ็กเกจได้</p><a className="font-semibold underline" href="/dashboard/settings/billing">อัปเกรดแพ็กเกจ</a></section><section className="grid gap-2 rounded-2xl border border-cyber-cyan/30 bg-cyber-cyan/10 p-4 text-sm text-cyber-cyan"><p className="font-semibold">ความปลอดภัยของงาน Download/Retry/Cancel</p><p>ทุก action ถูกจำกัดตาม capability flags (canDownload, canCancel, canRetry) จาก API และยังคงนโยบายคิวเดิม</p></section><section className="grid gap-3 cyber-card p-4 sm:grid-cols-3"><label className="text-sm font-medium text-slate-300">Org ID<input className="mt-1 w-full rounded-xl border border-white/20 px-3 py-2" value={orgId} onChange={(e) => setOrgId(e.target.value)} /></label><label className="text-sm font-medium text-slate-300">สถานะ<select className="mt-1 w-full rounded-xl border border-white/20 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="ALL">ทั้งหมด</option><option value="PENDING">รอคิว</option><option value="RUNNING">กำลังเรนเดอร์</option><option value="COMPLETED">สำเร็จ</option><option value="FAILED">ล้มเหลว</option><option value="CANCELLED">ยกเลิก</option></select></label><button className="self-end rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => void load()}>รีเฟรช</button></section>{error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}{loading ? <div className="rounded-xl border border-white/10 p-4 text-sm text-slate-400">กำลังโหลด...</div> : <RenderHistoryTable items={items} onCancel={(id) => void mutate(id, "cancel")} onRetry={(id) => void mutate(id, "retry")} />}</main>;
}
