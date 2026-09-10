"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = { label: string; href: string; badge?: string; icon?: string };
type MenuGroup = { title: string; eyebrow: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    title: "Main",
    eyebrow: "Workflow",
    items: [
      { label: "ภาพรวมแดชบอร์ด", href: "/dashboard", icon: "🏠" },
      { label: "คลังสินค้า", href: "/dashboard/products", icon: "🛍️" },
      { label: "เพิ่มสินค้าใหม่", href: "/dashboard/products/new", icon: "➕" },
      { label: "Shopee Affiliate", href: "/dashboard/shopee-affiliate", badge: "Live", icon: "🛒" },
      { label: "AI Generator", href: "/dashboard/generator", icon: "✍️" },
      { label: "ประวัติคอนเทนต์", href: "/dashboard/content-history", icon: "📑" },
      { label: "Prompt Templates", href: "/dashboard/templates", icon: "📚" },
      { label: "OCR Tools", href: "/dashboard/ocr", icon: "🔍" },
      { label: "สินค้าที่คล้ายกัน", href: "/dashboard/similar", icon: "🏷️" },
      { label: "Export Center", href: "/dashboard/export-center", icon: "📤" },
      { label: "ตั้งค่าระบบ", href: "/dashboard/settings", icon: "⚙️" },
    ],
  },
  {
    title: "HyperFrames",
    eyebrow: "Video Ops",
    items: [
      { label: "HyperFrames Studio", href: "/dashboard/hyperframes", icon: "🎬" },
      { label: "ประวัติเรนเดอร์", href: "/dashboard/hyperframes/renders", icon: "🎥" },
      { label: "Batch Render", href: "/dashboard/hyperframes/batch", icon: "🎞️" },
      { label: "HyperFrames Ops", href: "/dashboard/hyperframes/ops", icon: "⚡" },
      { label: "Operator Queue", href: "/dashboard/hyperframes/ops/queue", badge: "safe", icon: "⏳" },
    ],
  },
  {
    title: "Admin",
    eyebrow: "Control",
    items: [
      { label: "Admin Overview", href: "/dashboard/admin", icon: "🛡️" },
      { label: "Users & Orgs", href: "/dashboard/admin/users", icon: "👥" },
      { label: "System Health", href: "/dashboard/admin/system", icon: "🩺" },
      { label: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: "📋" },
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
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 p-4 shadow-sm backdrop-blur-xl md:block transition-colors">
      <Link href="/dashboard" className="group mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-900 dark:border-slate-700 dark:bg-slate-950 p-3.5 text-white shadow-sm transition hover:shadow-md">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-base font-black text-slate-950">Z</div>
        <div>
          <p className="text-sm font-bold tracking-wide">ZSP AI Studio</p>
          <p className="text-xs text-slate-400">Shopee & Video SaaS</p>
        </div>
      </Link>

      <div className="space-y-4">
        {menuGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <div className="mb-1.5 flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{group.title}</p>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">{group.eyebrow}</span>
            </div>
            <div className="space-y-0.5">
              {group.items.map((menu) => {
                const active = isActive(pathname, menu.href);
                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{menu.icon}</span>
                      <span>{menu.label}</span>
                    </span>
                    {menu.badge ? (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        active 
                          ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950" 
                          : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                      }`}>
                        {menu.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>
        ))}
      </div>
    </aside>
  );
}
