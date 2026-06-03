"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HyperFramesStatusGrid } from "@/components/hyperframes/HyperFramesStatusGrid";
import { OperatorWarningBanner } from "@/components/hyperframes/OperatorWarningBanner";
import { HyperframesTemplateBrowser } from "@/components/hyperframes/HyperframesTemplateBrowser";
import type { HyperframesTemplatePreset } from "@/lib/hyperframes/template-marketplace";

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

  const cards = [
    { label: "Render enabled", value: queueStatus?.renderEnabled ? "เปิด" : "ปิด/ไม่ทราบ", tone: queueStatus?.renderEnabled ? "success" as const : "warning" as const, hint: "ควบคุมด้วย environment flag" },
    { label: "Worker active", value: queueStatus?.serviceActive ? "active" : "inactive/unknown", tone: queueStatus?.serviceActive ? "success" as const : "warning" as const, hint: "แสดงสถานะเท่านั้น" },
    { label: "Service enabled", value: queueStatus?.serviceEnabled ? "enabled" : "disabled/unknown", tone: queueStatus?.serviceEnabled ? "success" as const : "info" as const, hint: "ไม่มี systemd controls ใน UI" },
    { label: "Duration", value: `${durationSeconds}s`, tone: "info" as const, hint: "จำกัดตาม policy ฝั่ง API" },
  ];


  function applyTemplate(preset: HyperframesTemplatePreset) {
    setPlatform(preset.defaultPlatform);
    setAspectRatio(preset.defaultAspectRatio);
    setDurationSeconds(preset.defaultDurationSeconds);
    setCaption(preset.scriptSeed);
    setMessage(`เลือก template: ${preset.title}`);
  }

  async function enqueueRender() {
    setIsRendering(true);
    setMessage("");
    const res = await fetch("/api/hyperframes/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, orgId: orgId.trim() || undefined, platform, aspectRatio, durationSeconds, caption: caption || undefined }) });
    const data = await res.json();
    setIsRendering(false);
    setMessage(data.ok ? `เพิ่มงานเข้าคิวแล้ว: ${data.data.jobId}` : (data.error?.message ?? "เริ่มเรนเดอร์ไม่สำเร็จ"));
  }

  return (
    <main className="space-y-6">
      <header className="glass-panel p-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyber-cyan">HyperFrames Studio</p>
          <h1 className="mt-2 text-3xl font-bold">สร้างวิดีโอโปรโมตแบบปลอดภัยและตรวจสอบได้</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">ออกแบบ composition สำหรับ Shopee Affiliate โดยคงขีดจำกัดคิว, โควต้า, worker safety และการเปิดเผย Affiliate ให้ชัดเจนก่อนเผยแพร่</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <Link className="cyber-button-primary rounded-full" href="/dashboard/hyperframes/renders">ประวัติเรนเดอร์</Link>
          <Link className="cyber-button-secondary rounded-full" href="/dashboard/hyperframes/batch">Batch Render</Link>
          <Link className="cyber-button-secondary rounded-full" href="/dashboard/hyperframes/ops">Ops</Link>
        </div>
      </header>

      <OperatorWarningBanner items={["ต้องมี Affiliate disclosure ทุกครั้งก่อนนำคอนเทนต์ไปเผยแพร่", "ระบบไม่ execute arbitrary HTML และไม่เปิดเผย local render paths", "การควบคุม worker จริงให้ทำผ่าน production CLI/systemd เท่านั้น"]} />
      <HyperFramesStatusGrid cards={cards} />

      <HyperframesTemplateBrowser onSelect={applyTemplate} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="cyber-card p-5">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">ตั้งค่า Composition</h2>
            <p className="mt-1 text-sm text-slate-400">เลือกสินค้าและกำหนดแพลตฟอร์มอย่างมีขีดจำกัดปลอดภัย</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-200">สินค้า
              <select className="mt-1.5 w-full rounded-xl border border-white/10 bg-cyber-bg px-3 py-2.5 text-sm text-white shadow-sm outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">เลือกสินค้า</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-200">Org ID (ไม่บังคับ)
              <input className="mt-1.5 w-full rounded-xl border border-white/10 bg-cyber-bg px-3 py-2.5 text-sm text-white shadow-sm outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan" value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="ใช้เมื่อเป็นงานทีม" />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold text-slate-200">แพลตฟอร์ม<select className="mt-1.5 w-full rounded-xl border border-white/10 bg-cyber-bg px-3 py-2.5 text-sm text-white" value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)}>{PLATFORM_OPTIONS.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-200">สัดส่วน<select className="mt-1.5 w-full rounded-xl border border-white/10 bg-cyber-bg px-3 py-2.5 text-sm text-white" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}>{ASPECT_RATIO_OPTIONS.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-200">ระยะเวลา<input type="number" min={3} max={300} className="mt-1.5 w-full rounded-xl border border-white/10 bg-cyber-bg px-3 py-2.5 text-sm text-white" value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))} /></label>
          </div>

          <label className="mt-4 block text-sm font-semibold text-slate-200">แคปชัน/ไอเดีย Composition
            <textarea maxLength={1200} className="mt-1.5 min-h-32 w-full rounded-xl border border-white/10 bg-cyber-bg px-3 py-2.5 text-sm text-white shadow-sm outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="ระบุ key message, CTA, จุดขายสินค้า และ platform tone" />
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button className="cyber-button-primary" disabled={!hasValidComposition || Boolean(disabledReason) || isRendering} onClick={() => void enqueueRender()}>
              {isRendering ? "กำลังเพิ่มคิว..." : <>ส่งเข้าคิวเรนเดอร์<span className="sr-only"> Render now</span></>}
            </button>
            {disabledReason ? <p className="text-sm font-medium text-amber-400">{disabledReason}</p> : null}
            {message ? <p className="text-sm text-slate-200">{message}</p> : null}
          </div>
        </div>

        <aside className="cyber-card p-5">
          <h2 className="text-lg font-bold text-white">Workflow ปลอดภัย</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="rounded-2xl bg-white/5 p-3"><b>1.</b> เลือกสินค้าที่ผู้ใช้บันทึกเอง</li>
            <li className="rounded-2xl bg-white/5 p-3"><b>2.</b> ตรวจ caption และ Affiliate disclosure</li>
            <li className="rounded-2xl bg-white/5 p-3"><b>3.</b> enqueue ผ่าน API ที่บังคับ queue limits</li>
            <li className="rounded-2xl bg-white/5 p-3"><b>4.</b> ติดตามผลและดาวน์โหลดผ่าน secure API route</li>
          </ol>
        </aside>
      </section>
    </main>
  );
}
