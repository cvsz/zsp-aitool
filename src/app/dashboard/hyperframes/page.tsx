"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HyperFramesStatusGrid } from "@/components/hyperframes/HyperFramesStatusGrid";
import { OperatorWarningBanner } from "@/components/hyperframes/OperatorWarningBanner";
import { HyperframesTemplateBrowser } from "@/components/hyperframes/HyperframesTemplateBrowser";
import type { HyperframesTemplatePreset } from "@/lib/hyperframes/template-marketplace";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

const ASPECT_RATIO_OPTIONS = ["9:16", "16:9", "1:1"] as const;
const PLATFORM_OPTIONS = ["tiktok", "shopee_video", "facebook", "instagram", "threads", "x"] as const;

type Product = { id: string; title: string };
type QueueStatus = { renderEnabled: boolean; serviceActive: boolean; serviceEnabled: boolean };

export default function HyperFramesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [orgId, setOrgId] = useState("");
  const [platform, setPlatform] = useState<(typeof PLATFORM_OPTIONS)[number]>("tiktok");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIO_OPTIONS)[number]>("9:16");
  const [durationSeconds, setDurationSeconds] = useState(15);
  const [caption, setCaption] = useState("");
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [message, setMessage] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts((data.data ?? []).map((i: Product) => ({ id: i.id, title: i.title }))))
      .catch(() => setProducts([]));

    fetch("/api/hyperframes/render/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setQueueStatus({
            renderEnabled: Boolean(data.data?.renderEnabled),
            serviceActive: Boolean(data.data?.serviceActive),
            serviceEnabled: Boolean(data.data?.serviceEnabled),
          });
        }
      })
      .catch(() => setQueueStatus(null));
  }, []);

  const hasValidComposition = Boolean(productId && caption.trim().length <= 1200);
  const disabledReason = useMemo(() => {
    if (!productId) return "กรุณาเลือกสินค้าจากคลัง";
    if (!queueStatus?.renderEnabled || !queueStatus?.serviceActive || !queueStatus?.serviceEnabled) {
      return "คิวเรนเดอร์ยังไม่พร้อมใช้งานในสภาพแวดล้อมนี้";
    }
    return "";
  }, [productId, queueStatus]);

  const cards = [
    {
      label: "Render Enabled",
      value: queueStatus?.renderEnabled ? "เปิด" : "ปิด/ไม่ทราบ",
      tone: queueStatus?.renderEnabled ? ("success" as const) : ("warning" as const),
      hint: "Environment Flag",
    },
    {
      label: "Worker Active",
      value: queueStatus?.serviceActive ? "Active" : "Inactive",
      tone: queueStatus?.serviceActive ? ("success" as const) : ("warning" as const),
      hint: "Background Worker",
    },
    {
      label: "Aspect Ratio",
      value: aspectRatio,
      tone: "info" as const,
      hint: "Default 9:16 Vertical",
    },
    {
      label: "Duration",
      value: `${durationSeconds}s`,
      tone: "info" as const,
      hint: "Safe Bound Limit",
    },
  ];

  function applyTemplate(preset: HyperframesTemplatePreset) {
    setPlatform(preset.defaultPlatform as (typeof PLATFORM_OPTIONS)[number]);
    setAspectRatio(preset.defaultAspectRatio);
    setDurationSeconds(preset.defaultDurationSeconds);
    setCaption(preset.scriptSeed);
    setMessage(`เลือก Template สำเร็จ: ${preset.title}`);
  }

  async function enqueueRender() {
    setIsRendering(true);
    setMessage("");
    try {
      const res = await fetch("/api/hyperframes/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orgId: orgId.trim() || undefined,
          platform,
          aspectRatio,
          durationSeconds,
          caption: caption || undefined,
        }),
      });
      const data = await res.json();
      setMessage(data.ok ? `✓ เพิ่มงานเข้าคิวเรนเดอร์แล้ว: ${data.data.jobId}` : (data.error?.message ?? "เริ่มเรนเดอร์ไม่สำเร็จ"));
    } catch {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อคิวเรนเดอร์");
    } finally {
      setIsRendering(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="HyperFrames Video Studio"
        subtitle="สร้างและเรนเดอร์วิดีโอโมชันกราฟิกโปรโมตสินค้า Shopee Affiliate ขนาด 9:16 สำหรับ TikTok และ Shopee Video"
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/hyperframes/renders">
              <Button variant="secondary" size="sm">🎥 ประวัติเรนเดอร์</Button>
            </Link>
            <Link href="/dashboard/hyperframes/batch">
              <Button variant="secondary" size="sm">🎞️ Batch Render</Button>
            </Link>
            <Link href="/dashboard/hyperframes/ops">
              <Button variant="secondary" size="sm">⚡ Ops</Button>
            </Link>
          </div>
        }
      />

      <OperatorWarningBanner
        items={[
          "ต้องระบุข้อความ Affiliate Disclosure ทุกครั้งก่อนนำวิดีโอไปเผยแพร่",
          "ระบบทำงานแบบ Bounded Queue เพื่อความปลอดภัยของเซิร์ฟเวอร์",
          "การดาวน์โหลดไฟล์วิดีโอทำผ่าน Secure Signed URL เท่านั้น",
        ]}
      />

      <HyperFramesStatusGrid cards={cards} />

      <HyperframesTemplateBrowser onSelect={applyTemplate} />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Composition Form */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่า Video Composition</CardTitle>
              <CardDescription>เลือกสินค้า กำหนดสัดส่วน และระบุ Key Message สำหรับวิดีโอ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    1. เลือกสินค้า
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    <option value="">เลือกสินค้าจากคลัง</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Org ID (ไม่บังคับ)
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    placeholder="ระบุเมื่อทำงานในองค์กร"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">แพลตฟอร์ม</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as typeof platform)}
                  >
                    {PLATFORM_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">สัดส่วนวิดีโอ</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}
                  >
                    {ASPECT_RATIO_OPTIONS.map((v) => <option key={v} value={v}>{v} {v === "9:16" ? "(Vertical)" : ""}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">ความยาว (วินาที)</label>
                  <input
                    type="number"
                    min={3}
                    max={300}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  แคปชัน / สคริปต์ไอเดีย
                </label>
                <textarea
                  maxLength={1200}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="ระบุจุดเด่นสินค้า, โปรโมชันราคาพิเศษ, และ Call to Action..."
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!hasValidComposition || Boolean(disabledReason) || isRendering}
                  onClick={() => void enqueueRender()}
                  busy={isRendering}
                >
                  🎬 ส่งเข้าคิวเรนเดอร์วิดีโอ
                </Button>
                {disabledReason ? (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{disabledReason}</span>
                ) : null}
                {message ? (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{message}</span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Sidebar */}
        <div className="lg:col-span-4">
          <Card tone="muted">
            <CardHeader>
              <CardTitle>ลำดับขั้นตอนการเรนเดอร์</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <li className="flex gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400">1.</span>
                  <span>เลือกสินค้าที่มีภาพความละเอียดสูงในคลัง</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400">2.</span>
                  <span>เลือก Template หรือกำหนดสคริปต์โปรโมต</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400">3.</span>
                  <span>Enqueue งานเข้าสู่ HyperFrames Render Worker</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400">4.</span>
                  <span>รับวิดีโอ MP4 9:16 สำหรับโพสต์ TikTok & Shopee Video</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
