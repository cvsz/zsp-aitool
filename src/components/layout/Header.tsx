"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const sectionTitles: { prefix: string; title: string; subtitle: string }[] = [
  { prefix: "/dashboard/admin", title: "Admin Console", subtitle: "ศูนย์ควบคุมและตรวจสอบระบบ" },
  { prefix: "/dashboard/hyperframes/ops", title: "HyperFrames Ops", subtitle: "สถานะ worker, queue และระบบเรนเดอร์" },
  { prefix: "/dashboard/hyperframes/renders", title: "ประวัติเรนเดอร์", subtitle: "ติดตาม ดาวน์โหลด และจัดการงานวิดีโอ" },
  { prefix: "/dashboard/hyperframes/batch", title: "Batch Render", subtitle: "สร้างวิดีโอหลายรายการอย่างมีขีดจำกัดปลอดภัย" },
  { prefix: "/dashboard/hyperframes", title: "HyperFrames Studio", subtitle: "สร้าง composition สำหรับวิดีโอโปรโมตสินค้า" },
  { prefix: "/dashboard/products/new", title: "เพิ่มสินค้า", subtitle: "บันทึกสินค้าใหม่เข้าคลัง Affiliate" },
  { prefix: "/dashboard/products", title: "คลังสินค้า", subtitle: "จัดการสินค้า ลิงก์ Affiliate และข้อมูลสำหรับคอนเทนต์" },
  { prefix: "/dashboard/generator", title: "AI Generator", subtitle: "สร้างโพสต์และบทความจากสินค้าอย่างปลอดภัย" },
  { prefix: "/dashboard/content-history", title: "ประวัติคอนเทนต์", subtitle: "ดูและส่งออกคอนเทนต์ที่สร้างไว้" },
  { prefix: "/dashboard/templates", title: "Prompt Templates", subtitle: "จัดการ template สำหรับแพลตฟอร์มต่าง ๆ" },
  { prefix: "/dashboard/ocr", title: "OCR Tools", subtitle: "แปลงภาพสินค้าเป็นข้อมูลที่ตรวจทานได้" },
  { prefix: "/dashboard/similar", title: "สินค้าที่คล้ายกัน", subtitle: "ค้นหาโอกาสคอนเทนต์จากคลังสินค้าของคุณ" },
  { prefix: "/dashboard/settings", title: "ตั้งค่า", subtitle: "ปรับแต่งบัญชีและ workflow" },
  { prefix: "/dashboard", title: "ภาพรวมแดชบอร์ด", subtitle: "ภาพรวมธุรกิจ Shopee Affiliate และ HyperFrames" },
];

export function Header() {
  const pathname = usePathname() ?? "/dashboard";
  const section = useMemo(() => sectionTitles.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`)) ?? sectionTitles[sectionTitles.length - 1], [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/90 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">ZSP Affiliate SaaS</p>
          <h1 className="mt-0.5 text-lg font-bold text-slate-950">{section.title}</h1>
          <p className="text-sm text-slate-500">{section.subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block">
            <span className="sr-only">ค้นหาโมดูล</span>
            <input placeholder="ค้นหาโมดูล (เร็ว ๆ นี้)" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200 sm:w-64" />
          </label>
          <StatusBadge label="Production-safe" tone="success" />
          <ThemeToggle />
          <button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">อัปเกรดแพ็กเกจ</button>
        </div>
      </div>
    </header>
  );
}
