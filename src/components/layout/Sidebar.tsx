"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = { label: string; href: string; badge?: string };
type MenuGroup = { title: string; eyebrow: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    title: "Main",
    eyebrow: "Workflow",
    items: [
      { label: "ภาพรวม", href: "/dashboard" },
      { label: "คลังสินค้า", href: "/dashboard/products" },
      { label: "เพิ่มสินค้า", href: "/dashboard/products/new" },
      { label: "Shopee Affiliate", href: "/dashboard/shopee-affiliate", badge: "DB" },
      { label: "AI Generator", href: "/dashboard/generator" },
      { label: "ประวัติคอนเทนต์", href: "/dashboard/content-history" },
      { label: "Prompt Templates", href: "/dashboard/templates" },
      { label: "OCR Tools", href: "/dashboard/ocr" },
      { label: "สินค้าที่คล้ายกัน", href: "/dashboard/similar" },
      { label: "ตั้งค่า", href: "/dashboard/settings" },
    ],
  },
  {
    title: "HyperFrames",
    eyebrow: "Video Ops",
    items: [
      { label: "HyperFrames Studio", href: "/dashboard/hyperframes" },
      { label: "ประวัติเรนเดอร์", href: "/dashboard/hyperframes/renders" },
      { label: "Batch Render", href: "/dashboard/hyperframes/batch" },
      { label: "HyperFrames Ops", href: "/dashboard/hyperframes/ops" },
      { label: "Operator Queue", href: "/dashboard/hyperframes/ops/queue", badge: "safe" },
    ],
  },
  {
    title: "Admin",
    eyebrow: "Control",
    items: [
      { label: "Admin Overview", href: "/dashboard/admin" },
      { label: "Users", href: "/dashboard/admin/users" },
      { label: "Products", href: "/dashboard/admin/products" },
      { label: "Content", href: "/dashboard/admin/content" },
      { label: "Renders", href: "/dashboard/admin/renders" },
      { label: "System Health", href: "/dashboard/admin/system" },
      { label: "Audit Logs", href: "/dashboard/admin/audit-logs" },
      { label: "Settings", href: "/dashboard/admin/settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto border-r border-white/70 bg-white/80 p-5 shadow-[0_0_40px_rgba(15,23,42,0.06)] backdrop-blur-xl md:block">
      <Link href="/dashboard" className="group mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-slate-950">Z</div>
        <div>
          <p className="text-sm font-bold tracking-wide">ZSP-AITool</p>
          <p className="text-xs text-slate-300">Shopee Affiliate SaaS</p>
        </div>
      </Link>

      <div className="space-y-5">
        {menuGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{group.title}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{group.eyebrow}</span>
            </div>
            <div className="space-y-1">
              {group.items.map((menu) => {
                const active = isActive(pathname, menu.href);
                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                    }`}
                  >
                    <span>{menu.label}</span>
                    {menu.badge ? <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-700"}`}>{menu.badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          </nav>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950">
        <p className="font-semibold">Production-safe mode</p>
        <p className="mt-1 text-xs text-indigo-700">Operator UI แสดงสถานะอย่างปลอดภัย ไม่มีการควบคุม systemd จากหน้าเว็บ</p>
      </div>
    </aside>
  );
}
