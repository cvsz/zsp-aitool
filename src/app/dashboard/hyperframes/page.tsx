"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const ASPECT_RATIO_OPTIONS = ["16:9", "9:16", "1:1"] as const;
const PLATFORM_OPTIONS = ["facebook", "instagram", "threads", "x", "blog"] as const;

type Product = { id: string; title: string };

type QueueStatus = { renderEnabled: boolean; serviceActive: boolean; serviceEnabled: boolean };

export default function HyperFramesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [orgId, setOrgId] = useState("");
  const [platform, setPlatform] = useState<(typeof PLATFORM_OPTIONS)[number]>("facebook");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIO_OPTIONS)[number]>("9:16");
  const [durationSeconds, setDurationSeconds] = useState(15);
  const [caption, setCaption] = useState("");
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [message, setMessage] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((res) => res.json()).then((data) => setProducts((data.data ?? []).map((item: Product) => ({ id: item.id, title: item.title })))).catch(() => setProducts([]));
    fetch("/api/hyperframes/render/status", { cache: "no-store" }).then((res) => res.json()).then((data) => {
      if (data.ok) setQueueStatus({ renderEnabled: Boolean(data.data?.renderEnabled), serviceActive: Boolean(data.data?.serviceActive), serviceEnabled: Boolean(data.data?.serviceEnabled) });
    }).catch(() => setQueueStatus(null));
  }, []);

  const disabledReason = useMemo(() => {
    if (!productId) return "กรุณาเลือกสินค้า";
    if (!queueStatus?.renderEnabled || !queueStatus?.serviceActive || !queueStatus?.serviceEnabled) return "บริการเรนเดอร์ยังไม่พร้อมใช้งาน";
    return "";
  }, [productId, queueStatus]);

  async function enqueueRender() {
    setIsRendering(true);
    setMessage("");
    const body = { productId, orgId: orgId.trim() || undefined, platform, aspectRatio, durationSeconds, caption: caption || undefined };
    const res = await fetch("/api/hyperframes/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setIsRendering(false);
    if (!data.ok) return setMessage(data.error?.message ?? "เริ่มเรนเดอร์ไม่สำเร็จ");
    setMessage(`เพิ่มงานเข้าคิวแล้ว: ${data.data.jobId}`);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">HyperFrames</h1>
        <p className="text-sm text-slate-600">สร้างวิดีโอโปรโมตสินค้า และเลือกแชร์งานไว้ในทีมด้วย Org ID ได้</p>
        <div className="flex gap-3 text-sm"><Link className="text-indigo-700 underline" href="/dashboard/hyperframes/renders">ดูประวัติ renders</Link><Link className="text-indigo-700 underline" href="/dashboard/hyperframes/ops">Ops</Link></div>
      </header>
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <label className="text-sm font-medium text-slate-700">สินค้า<select className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">เลือกสินค้า</option>{products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Org ID (ไม่บังคับ)<input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={orgId} onChange={(event) => setOrgId(event.target.value)} placeholder="เว้นว่างสำหรับงานส่วนตัว" /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">แพลตฟอร์ม<select className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={platform} onChange={(event) => setPlatform(event.target.value as typeof platform)}>{PLATFORM_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">สัดส่วน<select className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value as typeof aspectRatio)}>{ASPECT_RATIO_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">เวลา (วินาที)<input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="number" min={3} max={300} value={durationSeconds} onChange={(event) => setDurationSeconds(Number(event.target.value))} /></label>
        </div>
        <label className="text-sm font-medium text-slate-700">Caption<textarea className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={1200} /></label>
        <button className="rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={Boolean(disabledReason) || isRendering} onClick={() => void enqueueRender()}>{isRendering ? "กำลังเพิ่มคิว..." : "เริ่มเรนเดอร์"}</button>
        {disabledReason ? <p className="text-sm text-amber-700">{disabledReason}</p> : null}
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      </section>
    </main>
  );
}
