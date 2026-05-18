import Link from "next/link";

type MenuItem = { label: string; href: string; subtitle?: string };

const menus: MenuItem[] = [
  { label: "ภาพรวม", href: "/dashboard" },
  { label: "คลังสินค้า", href: "/dashboard/products" },
  { label: "เพิ่มสินค้า", href: "/dashboard/products/new" },
  { label: "AI Generator", href: "/dashboard/generator" },
  { label: "ประวัติคอนเทนต์", href: "/dashboard/content-history" },
  { label: "Prompt Templates", href: "/dashboard/templates" },
  { label: "OCR Tools", href: "/dashboard/ocr" },
  { label: "HyperFrames", subtitle: "วิดีโอโปรโมต AI", href: "/dashboard/hyperframes" },
  { label: "HyperFrames Ops", subtitle: "สถานะคิว operator", href: "/dashboard/hyperframes/ops" },
  { label: "สินค้าที่คล้ายกัน", href: "/dashboard/similar" },
  { label: "ตั้งค่า", href: "/dashboard/settings" },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 md:block">
      {menus.map((menu) => (
        <Link key={menu.href} href={menu.href} className="mb-1 block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
          <div>{menu.label}</div>
          {menu.subtitle ? <div className="text-xs text-slate-500">{menu.subtitle}</div> : null}
        </Link>
      ))}
    </aside>
  );
}
