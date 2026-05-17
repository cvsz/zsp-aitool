"use client";
import { useEffect, useState } from "react";

type Product = { id: string; title: string };

export default function HyperFramesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [durationSeconds, setDurationSeconds] = useState(15);
  const [caption, setCaption] = useState("");
  const [compositionHtml, setCompositionHtml] = useState("");

  useEffect(() => { fetch("/api/products").then((res) => res.json()).then((data) => setProducts((data.data ?? []).map((item: { id: string; title: string }) => ({ id: item.id, title: item.title })))); }, []);

  async function compose() {
    const response = await fetch("/api/hyperframes/compose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, platform, aspectRatio, durationSeconds, caption }) });
    const data = await response.json();
    if (data.ok) setCompositionHtml(data.data.compositionHtml);
  }

  function downloadHtml() {
    const blob = new Blob([compositionHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "hyperframe-composition.html"; a.click(); URL.revokeObjectURL(url);
  }

  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">HyperFrames</h1><p className="text-slate-600">สร้างวิดีโอโปรโมตจากข้อมูลสินค้าและคอนเทนต์ AI</p>
    <div className="grid gap-3 md:grid-cols-2">
      <select className="rounded border p-2" value={productId} onChange={(e) => setProductId(e.target.value)}><option value="">เลือกสินค้า</option>{products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}</select>
      <select className="rounded border p-2" value={platform} onChange={(e) => setPlatform(e.target.value)}>{["facebook", "instagram", "threads", "x", "blog"].map((item) => <option key={item}>{item}</option>)}</select>
      <select className="rounded border p-2" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>{["16:9", "9:16", "1:1"].map((item) => <option key={item}>{item}</option>)}</select>
      <input className="rounded border p-2" type="number" min={3} max={60} value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))} />
    </div>
    <textarea className="min-h-32 w-full rounded border p-2" placeholder="ใส่สคริปต์หรือแคปชัน" value={caption} onChange={(e) => setCaption(e.target.value)} />
    <div className="flex gap-2"><button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={compose}>สร้าง HTML Composition</button><button className="rounded border px-4 py-2" onClick={downloadHtml} disabled={!compositionHtml}>ส่งออก .html</button></div>
    <pre className="max-h-96 overflow-auto rounded bg-slate-100 p-3 text-xs">{compositionHtml || "ตัวอย่าง source จะปรากฏที่นี่"}</pre>
  </main>;
}
