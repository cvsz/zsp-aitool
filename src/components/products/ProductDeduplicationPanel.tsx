"use client";
import { useState } from "react";

type Group = { id: string; status: string; productIds: string[]; score: string | null; reason: unknown; canonicalProductId: string | null };

export function ProductDeduplicationPanel({ initialGroups }: { initialGroups: Group[] }) {
  const [groups, setGroups] = useState(initialGroups);
  const [loading, setLoading] = useState(false);
  const runScan = async () => { setLoading(true); await fetch('/api/products/deduplication/scan', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ limit: 200 })}); const res = await fetch('/api/products/deduplication/groups'); const json = await res.json(); setGroups(json.data ?? []); setLoading(false); };
  const dismiss = async (id: string) => { await fetch(`/api/products/deduplication/groups/${id}/dismiss`, { method:'POST' }); setGroups((g) => g.map((x)=>x.id===id?{...x,status:'DISMISSED'}:x)); };
  if (!groups.length) return <div className="rounded border p-4"><p>ยังไม่พบกลุ่มสินค้าซ้ำ</p><button onClick={runScan} className="mt-2 rounded bg-slate-900 px-3 py-2 text-white">{loading ? 'กำลังสแกน...' : 'สแกนหาซ้ำ'}</button></div>;
  return <div className="space-y-3"> <button onClick={runScan} className="rounded border px-3 py-2">{loading ? 'กำลังสแกน...' : 'สแกนอีกครั้ง'}</button>{groups.map((g)=><div key={g.id} className="rounded border p-3"><div className="text-sm">คะแนน: {g.score ?? '-'} | สถานะ: {g.status}</div><div className="text-sm">สินค้า: {g.productIds.join(', ')}</div><button onClick={()=>dismiss(g.id)} className="mt-2 rounded border px-2 py-1">ปิดการแจ้งเตือนกลุ่มนี้</button></div>)}</div>;
}
