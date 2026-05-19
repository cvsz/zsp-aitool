"use client";

import { useEffect, useState } from "react";
import { Platform, Tone } from "@prisma/client";
import { PlatformSelector } from "./PlatformSelector";
import { ToneSelector } from "./ToneSelector";
import { GeneratedContentCard } from "./GeneratedContentCard";

export function ContentGeneratorForm() {
  const [products, setProducts] = useState<{ id: string; title: string; description?: string | null }[]>([]);
  const [productId, setProductId] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([Platform.FACEBOOK]);
  const [tone, setTone] = useState<Tone>(Tone.FRIENDLY);
  const [language, setLanguage] = useState("th");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => { fetch("/api/products").then((r) => r.json()).then((d) => { const list = d?.data ?? []; setProducts(list); if (list[0]) setProductId(list[0].id); }); }, []);

  const submit = async () => { setLoading(true); setError(""); const res = await fetch("/api/ai/generate-batch", { method: "POST", body: JSON.stringify({ productId, platforms, tone, language, versions: 1 }), headers: { "Content-Type": "application/json" } }); const json = await res.json(); if (!res.ok || !json.ok) setError(json?.error?.message ?? "สร้างคอนเทนต์ไม่สำเร็จ"); else setResults(json.data.results ?? []); setLoading(false); };
  const selected = products.find((p) => p.id === productId);

  return <div className="space-y-4 rounded-xl border bg-white p-4">
    <p className="rounded bg-amber-50 p-3 text-xs text-amber-800">ประกาศ: คอนเทนต์นี้มีวัตถุประสงค์เพื่อการแนะนำสินค้าแบบ Affiliate โปรดใส่ข้อความเปิดเผยลิงก์แอฟฟิลิเอตทุกครั้ง</p>
    <div>
      <label className="mb-1 block text-sm font-medium">เลือกสินค้า</label>
      <select className="w-full rounded border px-2 py-2" value={productId} onChange={(e) => setProductId(e.target.value)}>{products.map((p) => <option value={p.id} key={p.id}>{p.title}</option>)}</select>
      {!selected?.description ? <p className="mt-1 text-xs text-amber-700">คำเตือน: ข้อมูลสินค้ายังไม่ครบ อาจทำให้ผลลัพธ์ไม่แม่นยำ</p> : null}
    </div>
    <div><label className="mb-1 block text-sm font-medium">แพลตฟอร์ม</label><PlatformSelector value={platforms} onChange={setPlatforms} multiple /></div>
    <div><label className="mb-1 block text-sm font-medium">โทนภาษา</label><ToneSelector value={tone} onChange={setTone} /></div>
    <div><label className="mb-1 block text-sm font-medium">ภาษา</label><input className="w-full rounded border px-2 py-2" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="th" /></div>
    <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={submit} disabled={loading}>{loading ? "กำลังสร้างคอนเทนต์..." : "สร้างคอนเทนต์"}</button>
    {error && <div className="text-sm text-red-600">{error}</div>}
    {!loading && results.length === 0 && <div className="text-sm text-slate-500">ยังไม่มีผลลัพธ์คอนเทนต์</div>}
    <div className="space-y-3">{results.map((r, idx) => <div key={idx} className="space-y-2"><div className="font-bold">{r.platform}</div>{(r.outputs ?? []).map((o: any) => <GeneratedContentCard key={o.version} item={o} />)}</div>)}</div>
  </div>;
}
