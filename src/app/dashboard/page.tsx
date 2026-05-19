"use client";

import Link from "next/link";

import { AlertBanner } from "@/components/ui/AlertBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
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

const releaseChecklist = [
  "เพิ่มสินค้าเข้าคลังอย่างน้อย 1 รายการ",
  "ผูกลิงก์ Affiliate สำหรับแพลตฟอร์มที่ใช้งาน",
  "สร้างโพสต์ AI และตรวจสอบ Affiliate Disclosure",
  "จัดตารางโพสต์สำหรับ Facebook / IG / Threads / X",
  "ทดสอบ Export เป็น CSV และ Markdown",
  "ตรวจสอบสถานะ HyperFrames ก่อนเรนเดอร์จริง",
];

const opsLinks = [
  { label: "คลังสินค้า", href: "/dashboard/products" },
  { label: "สร้างคอนเทนต์", href: "/dashboard/generator" },
  { label: "ประวัติคอนเทนต์", href: "/dashboard/content-history" },
  { label: "HyperFrames Studio", href: "/dashboard/hyperframes" },
  { label: "ตั้งค่าระบบ", href: "/dashboard/settings" },
];

export default function Page() {
  const { data, loading, error, refetch } = useApi<Overview>("/api/dashboard/overview");
  const { toast, showToast } = useToast();
  const recent = data?.recentActivity ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Final Release Dashboard"
        subtitle="ศูนย์ควบคุมก่อนปล่อยงานจริงสำหรับทีม Shopee Affiliate แบบ Thai-first"
        actions={
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            onClick={() => {
              void refetch();
              showToast("รีเฟรชข้อมูล Release Dashboard แล้ว", "success");
            }}
          >
            รีเฟรช
          </button>
        }
      />

      {loading ? <LoadingSpinner /> : null}
      {error ? <AlertBanner title="ดึงข้อมูลไม่สำเร็จ" description="ไม่สามารถโหลดข้อมูลภาพรวมได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard label="จำนวนสินค้า" value={data?.productCount ?? 0} hint="พร้อมใช้งาน" />
            <StatCard label="คอนเทนต์ที่สร้างแล้ว" value={data?.generatedContentCount ?? 0} hint="ตรวจสอบ Disclosure" />
            <StatCard label="Prompt Templates" value={data?.promptTemplateCount ?? 0} hint="รองรับหลายแพลตฟอร์ม" />
            <StatCard label="งานเรนเดอร์" value={data?.renderJobCount ?? 0} hint="รอ/กำลังทำ/เสร็จสิ้น" />
            <StatCard label="HyperFrames Health" value={data?.hyperframesHealth ?? "กำลังตรวจสอบ"} hint="สถานะระบบ" tone="info" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">Release Checklist</h2>
              <p className="mt-1 text-sm text-slate-500">รายการตรวจสอบสำคัญก่อนเปิดใช้งานจริง เพื่อลดความเสี่ยงด้านคุณภาพและ Compliance</p>
              <ul className="mt-4 space-y-2">
                {releaseChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
              <h2 className="text-lg font-semibold">Quick Ops</h2>
              <p className="mt-1 text-sm text-slate-300">ลิงก์ทางลัดสำหรับทีมปฏิบัติการ</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {opsLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">โมดูลหลักสำหรับ Final Release</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <ModuleCard title="เพิ่มสินค้า" description="เพิ่มรายการสินค้าใหม่เข้าคลัง" href="/dashboard/products/new" />
              <ModuleCard title="สร้างคอนเทนต์ AI" description="สร้างโพสต์สำหรับโซเชียลอย่างรวดเร็ว" href="/dashboard/generator" />
              <ModuleCard title="OCR ตรวจจับข้อความ" description="อัปโหลดภาพสินค้าและตรวจสอบผลก่อนบันทึก" href="/dashboard/ocr" />
              <ModuleCard title="HyperFrames Studio" description="สร้างวิดีโอโปรโมตพร้อมคิวเรนเดอร์" href="/dashboard/hyperframes" />
              <ModuleCard title="เทมเพลตและ Prompt" description="จัดการแม่แบบคอนเทนต์ทุกแพลตฟอร์ม" href="/dashboard/templates" />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">กิจกรรมล่าสุด</h2>
            {recent.length === 0 ? (
              <EmptyState title="ยังไม่มีกิจกรรม" description="เมื่อมีการเพิ่มสินค้า สร้างคอนเทนต์ หรือเรนเดอร์วิดีโอ จะแสดงที่นี่" />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                {recent.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-none">
                    <p className="text-sm text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.at}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </section>
  );
}
