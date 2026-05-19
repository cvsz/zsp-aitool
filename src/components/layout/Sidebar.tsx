"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = { label: string; href?: string; subtitle?: string };

const menuGroups: { title: string; items: MenuItem[] }[] = [
  { title: "Main", items: [
    { label: "ภาพรวม", href: "/dashboard" },
    { label: "คลังสินค้า", href: "/dashboard/products" },
    { label: "เพิ่มสินค้า", href: "/dashboard/products/new" },
    { label: "AI Generator", href: "/dashboard/generator" },
    { label: "ประวัติคอนเทนต์", href: "/dashboard/content-history" },
    { label: "Prompt Templates", href: "/dashboard/templates" },
    { label: "OCR Tools", href: "/dashboard/ocr" },
    { label: "สินค้าที่คล้ายกัน", href: "/dashboard/similar" },
    { label: "ตั้งค่า", href: "/dashboard/settings" },
  ]},
  { title: "HyperFrames", items: [
    { label: "HyperFrames Studio", href: "/dashboard/hyperframes" },
    { label: "ประวัติเรนเดอร์", href: "/dashboard/hyperframes/renders" },
    { label: "Batch Render", href: "/dashboard/hyperframes/batch" },
    { label: "HyperFrames Ops", href: "/dashboard/hyperframes/ops" },
    { label: "Operator Queue", href: "/dashboard/hyperframes/ops/queue" },
  ]},
  { title: "Admin", items: [
    { label: "Admin Overview", href: "/dashboard/admin" },
    { label: "Users", href: "/dashboard/admin/users" },
    { label: "Products", href: "/dashboard/admin/products" },
    { label: "Content", href: "/dashboard/admin/content" },
    { label: "Renders", href: "/dashboard/admin/renders" },
    { label: "System Health", href: "/dashboard/admin/system" },
    { label: "Audit Logs", href: "/dashboard/admin/audit-logs" },
    { label: "Settings", href: "/dashboard/admin/settings" },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="hidden w-80 border-r border-slate-200 bg-white p-4 md:block"><p className="mb-6 text-lg font-bold text-slate-900">ZSP-AITool</p>{menuGroups.map((group) => <div key={group.title} className="mb-5"><p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.title}</p>{group.items.map((menu) => menu.href ? <Link key={menu.label} href={menu.href} className={`mb-1 block rounded-xl px-3 py-2 text-sm ${pathname === menu.href ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}>{menu.label}</Link> : <div key={menu.label} className="mb-1 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-400">{menu.label}</div>)}</div>)}</aside>;
}
