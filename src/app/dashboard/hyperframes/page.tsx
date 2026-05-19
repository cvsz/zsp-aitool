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
    fetch("/api/products").then((res) => res.json()).then((data) => setProducts((data.data ?? []).map((i: Product) => ({ id: i.id, title: i.title })))).catch(() => setProducts([]));
    fetch("/api/hyperframes/render/status", { cache: "no-store" }).then((res) => res.json()).then((data) => {
      if (data.ok) setQueueStatus({ renderEnabled: Boolean(data.data?.renderEnabled), serviceActive: Boolean(data.data?.serviceActive), serviceEnabled: Boolean(data.data?.serviceEnabled) });
    }).catch(() => setQueueStatus(null));
  }, []);

  const hasValidComposition = Boolean(productId && caption.trim().length <= 1200);
  const disabledReason = useMemo(() => {
    if (!productId) return "กรุณาเลือกสินค้า";
    if (!queueStatus?.renderEnabled || !queueStatus?.serviceActive || !queueStatus?.serviceEnabled) return "คิวเรนเดอร์ยังไม่พร้อม";
    return "";
  }, [productId, queueStatus]);

  async function enqueueRender() {
    setIsRendering(true);
    setMessage("");
    const res = await fetch("/api/hyperframes/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, orgId: orgId.trim() || undefined, platform, aspectRatio, durationSeconds, caption: caption || undefined }) });
    const data = await res.json();
    setIsRendering(false);
    setMessage(data.ok ? `เพิ่มงานเข้าคิวแล้ว: ${data.data.jobId}` : (data.error?.message ?? "เริ่มเรนเดอร์ไม่สำเร็จ"));
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">HyperFrames Studio</h1>
        <p className="text-sm text-slate-600">ออกแบบ composition และส่งงานอย่างปลอดภัยสำหรับ Shopee Affiliate</p>
        <p className="rounded border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-900">ประกาศ: คอนเทนต์นี้มีลิงก์แนะนำสินค้าแบบ Affiliate ผู้ใช้ควรเปิดเผยให้ชัดเจนก่อนเผยแพร่</p>
        <div className="flex gap-4 text-sm">
          <Link className="text-indigo-700 underline" href="/dashboard/hyperframes/renders">ประวัติเรนเดอร์</Link>
          <Link className="text-indigo-700 underline" href="/dashboard/hyperframes/batch">Batch</Link>
          <Link className="text-indigo-700 underline" href="/dashboard/hyperframes/ops">Ops</Link>
        </div>
      </header>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">สินค้า
            <select className="mt-1 w-full rounded border px-3 py-2" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">เลือกสินค้า</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Org ID (ไม่บังคับ)
            <input className="mt-1 w-full rounded border px-3 py-2" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">แพลตฟอร์ม<select className="mt-1 w-full rounded border px-3 py-2" value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)}>{PLATFORM_OPTIONS.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label className="text-sm font-medium">สัดส่วน<select className="mt-1 w-full rounded border px-3 py-2" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}>{ASPECT_RATIO_OPTIONS.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label className="text-sm font-medium">ระยะเวลา (วินาที)<input type="number" min={3} max={300} className="mt-1 w-full rounded border px-3 py-2" value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))} /></label>
        </div>

        <label className="text-sm font-medium">แคปชัน/ไอเดีย Composition
          <textarea maxLength={1200} className="mt-1 min-h-28 w-full rounded border px-3 py-2" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </label>

        <button className="rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!hasValidComposition || Boolean(disabledReason) || isRendering} onClick={() => void enqueueRender()}>
          {isRendering ? "กำลังเพิ่มคิว..." : <>ส่งเข้าคิวเรนเดอร์<span className="sr-only"> Render now</span></>}
        </button>
        {disabledReason ? <p className="text-sm text-amber-700">{disabledReason}</p> : null}
        {message ? <p className="text-sm">{message}</p> : null}
      </section>
    </main>
  );
}
