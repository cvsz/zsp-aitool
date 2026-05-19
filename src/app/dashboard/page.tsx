"use client";

import Link from "next/link";

import { AlertBanner } from "@/components/ui/AlertBanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type Overview = {
  productCount?: number;
  generatedContentCount?: number;
  promptTemplateCount?: number;
  renderJobCount?: number;
  hyperframesHealth?: "พร้อมใช้งาน" | "กำลังตรวจสอบ" | "ต้องตรวจสอบ";
  recentActivity?: { title: string; at: string }[];
};

const onboardingChecklist = [
  "1) เพิ่มสินค้าเข้าคลังอย่างน้อย 1 รายการ",
  "2) ตั้งค่าลิงก์ Affiliate ให้ถูกต้องก่อนเผยแพร่",
  "3) สร้างคอนเทนต์ AI จากสินค้าที่ต้องการโปรโมต",
  "4) คัดลอกหรือ Export คอนเทนต์ที่ตรวจทานแล้ว",
  "5) (ตัวเลือก) เปิด HyperFrames เพื่อสร้างวิดีโอโปรโมต",
  "6) ตรวจสอบข้อความ Affiliate Disclosure ทุกโพสต์",
];

const quickActions = [
  { title: "เพิ่มสินค้า", href: "/dashboard/products/new", description: "บันทึกสินค้าใหม่เข้าคลัง" },
  { title: "สร้างคอนเทนต์ AI", href: "/dashboard/generator", description: "สร้างโพสต์ตามแพลตฟอร์ม" },
  { title: "คัดลอก/Export คอนเทนต์", href: "/dashboard/content-history", description: "ส่งออก CSV, TXT หรือ Markdown" },
  { title: "เปิด HyperFrames Studio", href: "/dashboard/hyperframes", description: "สร้างวิดีโอโปรโมตสินค้า" },
  { title: "เปิด OCR", href: "/dashboard/ocr", description: "ดึงข้อมูลจากภาพและตรวจทาน" },
  { title: "ดูประวัติเรนเดอร์", href: "/dashboard/hyperframes/renders", description: "ติดตามผลเรนเดอร์ล่าสุด" },
  { title: "จัดการ Prompt Templates", href: "/dashboard/templates", description: "บริหารเทมเพลตสำหรับหลายช่องทาง" },
];

function healthTone(health: Overview["hyperframesHealth"]) {
  if (health === "พร้อมใช้งาน") return "success" as const;
  if (health === "ต้องตรวจสอบ") return "warning" as const;
  return "info" as const;
}

export default function Page() {
  const { data, loading, error, refetch } = useApi<Overview>("/api/dashboard/overview");
  const { toast, showToast } = useToast();
  const [feedback, setFeedback] = useState("");
  const recent = data?.recentActivity ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title="ศูนย์ควบคุม ZSP Affiliate"
        subtitle="ภาพรวมการทำงานประจำวันแบบ Thai-first พร้อมแนวทางใช้งานที่ปลอดภัยและสอดคล้อง Compliance"
        actions={
          <>
            <Button variant="secondary" onClick={() => void refetch()}>
              รีเฟรชข้อมูล
            </Button>
            <Button
              onClick={() => {
                void refetch();
                showToast("รีเฟรชแดชบอร์ดเรียบร้อยแล้ว", "success");
              }}
            >
              อัปเดตด่วน
            </Button>
          </>
        }
      />

      <Card tone="dark" className="overflow-hidden">
        <CardContent className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Dashboard Overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">พร้อมเริ่มงานขายด้วยข้อมูลที่ตรวจสอบได้</h2>
            <p className="mt-2 text-sm text-slate-300">ทุกคอนเทนต์ควรเปิดเผยว่าเป็นลิงก์ Affiliate และตรวจสอบข้อมูลสินค้าก่อนเผยแพร่เสมอ เพื่อความน่าเชื่อถือของแบรนด์และความปลอดภัยของผู้ใช้</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/dashboard/products/new" className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              เพิ่มสินค้าใหม่
            </Link>
            <Link href="/dashboard/generator" className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              สร้างคอนเทนต์ AI
            </Link>
            <Link href="/dashboard/content-history" className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              คัดลอกหรือ Export คอนเทนต์
            </Link>
            <Link href="/dashboard/hyperframes" className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              เปิด HyperFrames Studio (ตัวเลือก)
            </Link>
          </div>
        </CardContent>
      </Card>

      {loading ? <LoadingSpinner /> : null}
      {error ? <AlertBanner title="ดึงข้อมูลภาพรวมไม่สำเร็จ" description="ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" variant="error" /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="จำนวนสินค้า" value={data?.productCount ?? 0} hint="พร้อมใช้งาน" />
            <StatCard label="คอนเทนต์ที่สร้างแล้ว" value={data?.generatedContentCount ?? 0} hint="ต้องมี Disclosure" />
            <StatCard label="Prompt Templates" value={data?.promptTemplateCount ?? 0} hint="รองรับหลายช่องทาง" />
            <StatCard label="งานเรนเดอร์" value={data?.renderJobCount ?? 0} hint="ติดตามคิวได้" />
            <StatCard label="HyperFrames Health" value={data?.hyperframesHealth ?? "กำลังตรวจสอบ"} hint="สถานะระบบ" tone={healthTone(data?.hyperframesHealth)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding & Release Checklist</CardTitle>
                <CardDescription>เช็กลิสต์ก่อนใช้งานจริงเพื่อให้พร้อมทั้งด้านเนื้อหาและการปฏิบัติตามข้อกำหนด</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {onboardingChecklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card tone="info">
              <CardHeader>
                <CardTitle>Compliance Notice</CardTitle>
                <CardDescription>เพื่อความปลอดภัยของบัญชีและความโปร่งใสของผู้ติดตาม</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• หลีกเลี่ยงการอ้างอิงสรรพคุณเกินจริงหรือข้อมูลที่ตรวจสอบไม่ได้</p>
                <p>• เพิ่มคำชี้แจง Affiliate Disclosure ทุกคอนเทนต์ที่มีลิงก์</p>
                <p>• ตรวจทานข้อมูลจาก OCR และ AI ก่อนบันทึกหรือโพสต์</p>
                <StatusBadge label="โหมดปลอดภัยสำหรับการใช้งานจริง" tone="success" />
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">ทางลัดการทำงาน</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => (
                <ModuleCard key={action.href} title={action.title} description={action.description} href={action.href} />
              ))}
            </div>
          </div>



          <Card>
            <CardHeader>
              <CardTitle>ส่งความเห็นเพื่อพัฒนา Onboarding</CardTitle>
              <CardDescription>เก็บเฉพาะคะแนนและข้อความเชิงผลิตภัณฑ์ ไม่เก็บข้อมูลลับหรือเนื้อหาส่วนตัว</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full rounded-xl border p-3 text-sm" rows={4} placeholder="บอกทีมว่าอะไรช่วยให้คุณเริ่มใช้งานได้เร็วขึ้น (อย่างน้อย 10 ตัวอักษร)" />
              <Button onClick={async () => {
                const trimmed = feedback.trim();
                if (trimmed.length < 10) { showToast("กรุณากรอกอย่างน้อย 10 ตัวอักษร", "error"); return; }
                const response = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rating: 5, category: 'onboarding', message: trimmed }) });
                if (!response.ok) { showToast("ส่งความเห็นไม่สำเร็จ", "error"); return; }
                setFeedback("");
                showToast("ขอบคุณสำหรับความคิดเห็น", "success");
              }}>ส่งความเห็น</Button>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">กิจกรรมล่าสุด</h2>
            {recent.length === 0 ? (
              <EmptyState title="ยังไม่มีกิจกรรมล่าสุด" description="เมื่อมีการเพิ่มสินค้า สร้างคอนเทนต์ หรือเรนเดอร์วิดีโอ ระบบจะแสดงสรุปที่ปลอดภัยในส่วนนี้" tone="muted" />
            ) : (
              <Card>
                <CardContent>
                  {recent.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-none">
                      <p className="text-sm text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.at}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : null}

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </section>
  );
}
