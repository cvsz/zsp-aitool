"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { AlertBanner } from "@/components/ui/AlertBanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

type Overview = {
  productCount?: number;
  generatedContentCount?: number;
  promptTemplateCount?: number;
  renderJobCount?: number;
  hyperframesHealth?: "พร้อมใช้งาน" | "กำลังตรวจสอบ" | "ต้องตรวจสอบ";
  recentActivity?: { title: string; at: string }[];
};

const workflowSteps = [
  {
    step: "01",
    title: "นำเข้าสินค้า & ลิงก์",
    description: "วางลิงก์ Shopee หรือสแกนภาพสินค้าด้วย OCR",
    href: "/dashboard/shopee-affiliate",
    icon: "🛒",
    badge: "Step 1",
  },
  {
    step: "02",
    title: "สร้างคอนเทนต์ AI",
    description: "เขียนแคปชันรีวิว Hook ภาษาไทยพร้อมคำเปิดเผย",
    href: "/dashboard/generator",
    icon: "✍️",
    badge: "Step 2",
  },
  {
    step: "03",
    title: "สร้างวิดีโอ HyperFrames",
    description: "เรนเดอร์วิดีโอ 9:16 สำหรับ TikTok & Shopee Video",
    href: "/dashboard/hyperframes",
    icon: "🎬",
    badge: "Step 3",
  },
  {
    step: "04",
    title: "ส่งออก & เผยแพร่",
    description: "ดาวน์โหลดคอนเทนต์และไฟล์วิดีโอพร้อมใช้งาน",
    href: "/dashboard/export-center",
    icon: "📤",
    badge: "Step 4",
  },
];

const studioTools = [
  { title: "Shopee Affiliate Ingestion", description: "นำเข้าลิงก์และวิเคราะห์สินค้า Shopee", href: "/dashboard/shopee-affiliate", icon: "🛒" },
  { title: "AI Content Generator", description: "เขียนรีวิว แคปชัน แฮชแท็กตามแพลตฟอร์ม", href: "/dashboard/generator", icon: "✍️" },
  { title: "HyperFrames Video Studio", description: "สร้างวิดีโอโมชันกราฟิกโปรโมตสินค้า", href: "/dashboard/hyperframes", icon: "🎬" },
  { title: "Product Spec OCR", description: "ดึงข้อมูลสเปกจากภาพถ่ายสินค้า", href: "/dashboard/ocr", icon: "🔍" },
  { title: "คลังสินค้า Affiliate", description: "จัดการสินค้า ลิงก์ และหมวดหมู่", href: "/dashboard/products", icon: "🛍️" },
  { title: "ประวัติคอนเทนต์", description: "ดูย้อนหลังและจัดการโพสต์ทั้งหมด", href: "/dashboard/content-history", icon: "📑" },
  { title: "Prompt Templates", description: "คลังเทมเพลตคำสั่ง AI สำหรับการตลาด", href: "/dashboard/templates", icon: "📚" },
  { title: "สินค้าที่คล้ายกัน", description: "ตรวจจับและจัดกลุ่มสินค้าซ้ำ", href: "/dashboard/similar", icon: "🏷️" },
  { title: "Admin Console", description: "ตรวจสอบสถานะระบบและ Audit Logs", href: "/dashboard/admin", icon: "🛡️" },
];

const complianceChecklist = [
  { text: "เพิ่มข้อมูลสินค้าและสเปกที่ถูกต้องเข้าคลัง", done: true },
  { text: "ระบุข้อความ Affiliate Disclosure ในทุกคอนเทนต์ที่มีลิงก์", done: true },
  { text: "ตรวจสอบราคาและโปรโมชันก่อนนำไปโพสต์จริง", done: true },
  { text: "ไม่ใช้ข้อความอวดอ้างสรรพคุณเกินจริงหรือรีวิวปลอม", done: true },
];

function getHealthBadge(health?: Overview["hyperframesHealth"]) {
  if (health === "พร้อมใช้งาน") return { tone: "success" as const, label: "Online" };
  if (health === "ต้องตรวจสอบ") return { tone: "warning" as const, label: "Checking" };
  return { tone: "info" as const, label: "Ready" };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useApi<Overview>("/api/dashboard/overview");
  const { toast, showToast } = useToast();
  const [quickLink, setQuickLink] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleQuickIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLink.trim()) {
      showToast("กรุณาระบุลิงก์สินค้า Shopee", "error");
      return;
    }
    router.push(`/dashboard/shopee-affiliate?url=${encodeURIComponent(quickLink.trim())}`);
  };

  const handleSendFeedback = async () => {
    const trimmed = feedback.trim();
    if (trimmed.length < 10) {
      showToast("กรุณากรอกข้อความอย่างน้อย 10 ตัวอักษร", "error");
      return;
    }
    setSubmittingFeedback(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating: 5, category: "dashboard", message: trimmed }),
      });
      if (!response.ok) throw new Error();
      setFeedback("");
      showToast("ขอบคุณสำหรับข้อเสนอแนะ ทีมงานได้รับข้อมูลแล้ว", "success");
    } catch {
      showToast("ส่งความคิดเห็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const recent = data?.recentActivity ?? [];
  const health = getHealthBadge(data?.hyperframesHealth);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Hero */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                ⚡ ZSP AI Studio
              </span>
              <StatusBadge label={health.label} tone={health.tone} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ศูนย์ควบคุม Shopee Affiliate & Video Ops
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              ผู้ช่วย AI ภาษาไทยครบวงจรสำหรับครีเอเตอร์ Shopee Affiliate สร้างคอนเทนต์รีวิว สคริปต์สั้น และวิดีโอ HyperFrames อย่างปลอดภัย
            </p>
          </div>

          {/* Quick Shopee URL Ingestion Box */}
          <form onSubmit={handleQuickIngest} className="w-full lg:w-96 flex-shrink-0 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ⚡ นำเข้าลิงก์สินค้าด่วน
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="วางลิงก์ Shopee (https://shope.ee/...)"
                value={quickLink}
                onChange={(e) => setQuickLink(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Button type="submit" variant="primary" size="md">
                เริ่ม
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="สินค้าในคลัง"
          value={data?.productCount ?? 0}
          hint="พร้อมโปรโมต"
          icon="🛍️"
          tone="default"
        />
        <StatCard
          label="คอนเทนต์ที่สร้างแล้ว"
          value={data?.generatedContentCount ?? 0}
          hint="AI Generated"
          icon="✍️"
          tone="info"
        />
        <StatCard
          label="Prompt Templates"
          value={data?.promptTemplateCount ?? 0}
          hint="Multi-Platform"
          icon="📚"
          tone="default"
        />
        <StatCard
          label="งานเรนเดอร์วิดีโอ"
          value={data?.renderJobCount ?? 0}
          hint="HyperFrames"
          icon="🎬"
          tone="success"
        />
      </div>

      {/* Interactive 4-Step Affiliate Workflow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">กระบวนการทำงาน 4 ขั้นตอน (Workflow)</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">เริ่มจากนำเข้าสินค้าจนถึงดาวน์โหลดวิดีโอพร้อมโพสต์</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            🔄 รีเฟรชข้อมูล
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((wf) => (
            <Link
              key={wf.step}
              href={wf.href}
              className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{wf.icon}</span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {wf.badge}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {wf.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {wf.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Studio Tools Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">เครื่องมือทั้งหมดใน Studio</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studioTools.map((tool) => (
            <ModuleCard
              key={tool.href}
              title={tool.title}
              description={tool.description}
              href={tool.href}
              icon={tool.icon}
            />
          ))}
        </div>
      </div>

      {/* Compliance & Activity Split Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Compliance Checklist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>มาตรฐานความปลอดภัย & ข้อกำหนด (Compliance)</CardTitle>
              <StatusBadge label="100% Safe" tone="success" />
            </div>
            <CardDescription>
              แนวทางปฏิบัติเพื่อป้องกันการถูกแบนบัญชีและสร้างความน่าเชื่อถือ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {complianceChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    ✓
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Activity Stream */}
        <Card>
          <CardHeader>
            <CardTitle>ประวัติการทำงานล่าสุด (Recent Activity)</CardTitle>
            <CardDescription>สรุปการสร้างคอนเทนต์และเรนเดอร์วิดีโอล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <AlertBanner
                title="ดึงข้อมูลไม่สำเร็จ"
                description="ไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้"
                variant="error"
              />
            ) : recent.length === 0 ? (
              <EmptyState
                title="ยังไม่มีกิจกรรมล่าสุด"
                description="เมื่อมีการเพิ่มสินค้า สร้างโพสต์ หรือเรนเดอร์วิดีโอ ระบบจะบันทึกและแสดงที่นี่"
                tone="muted"
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recent.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-800 dark:text-slate-200">{item.title}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{item.at}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Card */}
      <Card tone="muted">
        <CardHeader>
          <CardTitle>ส่งข้อเสนอแนะเพื่อพัฒนา Studio</CardTitle>
          <CardDescription>
            ร่วมพัฒนาฟีเจอร์สำหรับครีเอเตอร์ Shopee Affiliate ให้ดียิ่งขึ้น
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={3}
            placeholder="แจ้งฟีเจอร์ที่ต้องการ หรือปัญหาที่พบระหว่างใช้งาน..."
          />
          <Button onClick={handleSendFeedback} busy={submittingFeedback} variant="primary">
            ส่งข้อเสนอแนะ
          </Button>
        </CardContent>
      </Card>

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </div>
  );
}
