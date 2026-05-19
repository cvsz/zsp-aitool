"use client";

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

export default function Page() {
  const { data, loading, error, refetch } = useApi<Overview>("/api/dashboard/overview");
  const { toast, showToast } = useToast();
  const recent = data?.recentActivity ?? [];

  return (
    <section>
      <PageHeader
        title="ภาพรวมแดชบอร์ด"
        subtitle="ภาพรวมธุรกิจและการทำงานของระบบแบบ Thai-first"
        actions={<button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" onClick={() => { void refetch(); showToast("รีเฟรชข้อมูลแล้ว", "success"); }}>รีเฟรช</button>}
      />

      {loading ? <LoadingSpinner /> : null}
      {error ? <AlertBanner title="ดึงข้อมูลไม่สำเร็จ" description="ไม่สามารถโหลดข้อมูลภาพรวมได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" /> : null}

      {!loading && !error ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard label="จำนวนสินค้า" value={data?.productCount ?? 0} />
            <StatCard label="คอนเทนต์ที่สร้างแล้ว" value={data?.generatedContentCount ?? 0} />
            <StatCard label="Prompt Templates" value={data?.promptTemplateCount ?? 0} />
            <StatCard label="งานเรนเดอร์" value={data?.renderJobCount ?? 0} />
            <StatCard label="HyperFrames Health" value={data?.hyperframesHealth ?? "กำลังตรวจสอบ"} hint="สถานะระบบ" tone="info" />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">ทางลัดการทำงาน</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <ModuleCard title="เพิ่มสินค้า" description="เพิ่มรายการสินค้าใหม่เข้าคลัง" href="/dashboard/products/new" />
              <ModuleCard title="สร้างคอนเทนต์ AI" description="สร้างโพสต์สำหรับโซเชียลอย่างรวดเร็ว" href="/dashboard/generator" />
              <ModuleCard title="สร้างวิดีโอ HyperFrames" description="เข้าใช้งาน Studio และเริ่มเรนเดอร์" href="/dashboard/hyperframes" />
              <ModuleCard title="ดูประวัติเรนเดอร์" description="ติดตามสถานะงานและดาวน์โหลดไฟล์" href="/dashboard/hyperframes/renders" />
              <ModuleCard title="Export ข้อมูล" description="จัดการส่งออกข้อมูลสินค้าและคอนเทนต์" href="/dashboard/products" />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">กิจกรรมล่าสุด</h2>
            {recent.length === 0 ? (
              <EmptyState title="ยังไม่มีกิจกรรม" description="เมื่อมีการเพิ่มสินค้า สร้างคอนเทนต์ หรือเรนเดอร์วิดีโอ จะแสดงที่นี่" />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                {recent.map((item, index) => <div key={`${item.title}-${index}`} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-none"><p className="text-sm text-slate-700">{item.title}</p><p className="text-xs text-slate-400">{item.at}</p></div>)}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </section>
  );
}
