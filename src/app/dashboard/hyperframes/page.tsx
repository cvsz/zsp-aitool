"use client";

import { useEffect, useMemo, useState } from "react";

import { exportSubtitlesToSrt, exportSubtitlesToVtt, type HyperFrameSubtitle } from "@/lib/hyperframes/subtitles";

type Product = { id: string; title: string };
type Beat = { atSecond: number; text: string };

const SCRIPT_PLATFORMS = ["tiktok", "reels", "shorts", "generic"] as const;
const ASPECT_RATIO_OPTIONS = ["16:9", "9:16", "1:1"] as const;

export default function HyperFramesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [platform, setPlatform] = useState<(typeof SCRIPT_PLATFORMS)[number]>("tiktok");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIO_OPTIONS)[number]>("9:16");
  const [durationSeconds, setDurationSeconds] = useState(15);
  const [tone, setTone] = useState("friendly");
  const [language, setLanguage] = useState("th");
  const [script, setScript] = useState("");
  const [beats, setBeats] = useState<Beat[]>([]);
  const [captions, setCaptions] = useState<HyperFrameSubtitle[]>([]);
  const [composition, setComposition] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => { fetch("/api/products").then((res) => res.json()).then((data) => setProducts((data.data ?? []).map((item: Product) => ({ id: item.id, title: item.title })))); }, []);
  const canGenerate = useMemo(() => Boolean(productId), [productId]);

  async function generateScript() {
    setErrorMessage("");
    const res = await fetch("/api/hyperframes/script", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, platform, tone, language, durationSeconds, aspectRatio }) });
    const data = await res.json();
    if (!data.ok) return setErrorMessage(data?.error?.message ?? "สร้างสคริปต์ไม่สำเร็จ");
    setScript(data.data.script);
    setBeats(data.data.beats);
    setCaptions(data.data.captions ?? []);
  }

  async function createComposition() {
    const res = await fetch("/api/hyperframes/script-to-composition", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ beats, durationSeconds, aspectRatio }) });
    const data = await res.json();
    if (!data.ok) return setErrorMessage(data?.error?.message ?? "สร้าง metadata ไม่สำเร็จ");
    setComposition(JSON.stringify(data.data, null, 2));
  }

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">HyperFrames</h1><p className="text-slate-600">AI script generation (safe mode, no auto-render)</p>
    <div className="grid gap-3 md:grid-cols-3"><select className="rounded border p-2" value={productId} onChange={(e) => setProductId(e.target.value)}><option value="">เลือกสินค้า</option>{products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select><select className="rounded border p-2" value={platform} onChange={(e) => setPlatform(e.target.value as never)}>{SCRIPT_PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select><input className="rounded border p-2" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="tone" /></div>
    <div className="grid gap-3 md:grid-cols-3"><input className="rounded border p-2" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="language" /><select className="rounded border p-2" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as never)}>{ASPECT_RATIO_OPTIONS.map((a) => <option key={a}>{a}</option>)}</select><input className="rounded border p-2" type="number" min={3} max={60} value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))} /></div>
    <div className="flex gap-2"><button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={!canGenerate} onClick={generateScript}>Generate script</button><button className="rounded border px-4 py-2" disabled={!beats.length} onClick={createComposition}>Create composition</button><button className="rounded border px-4 py-2" disabled={!captions.length} onClick={() => { const b = new Blob([exportSubtitlesToSrt(captions)], { type: "application/x-subrip" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "captions.srt"; a.click(); URL.revokeObjectURL(u); }}>Export SRT</button><button className="rounded border px-4 py-2" disabled={!captions.length} onClick={() => { const b = new Blob([exportSubtitlesToVtt(captions)], { type: "text/vtt" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "captions.vtt"; a.click(); URL.revokeObjectURL(u); }}>Export VTT</button></div>
    <textarea className="min-h-28 w-full rounded border p-2" value={script} onChange={(e) => setScript(e.target.value)} />
    <div className="space-y-2">{beats.map((b, idx) => <div key={idx} className="grid grid-cols-[120px_1fr] gap-2"><input className="rounded border p-2" type="number" value={b.atSecond} onChange={(e) => setBeats((prev) => prev.map((x, i) => i === idx ? { ...x, atSecond: Number(e.target.value) } : x))} /><input className="rounded border p-2" value={b.text} onChange={(e) => setBeats((prev) => prev.map((x, i) => i === idx ? { ...x, text: e.target.value } : x))} /></div>)}</div>
    <div className="rounded border bg-slate-50 p-3 text-sm"><p className="mb-2 font-semibold">Caption preview</p>{captions.map((caption, idx) => <div key={idx} className="mb-1">[{caption.start.toFixed(1)}-{caption.end.toFixed(1)}] {caption.text} ({caption.language})</div>)}</div>
    {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    <pre className="max-h-96 overflow-auto rounded bg-slate-100 p-3 text-xs">{composition || "Composition metadata preview"}</pre></main>;
}
