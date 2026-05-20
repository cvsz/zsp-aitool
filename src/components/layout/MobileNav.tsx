import Link from "next/link";

const links = [
  { href: "/dashboard", label: "ภาพรวม" },
  { href: "/dashboard/products/new", label: "เพิ่มสินค้า" },
  { href: "/dashboard/generator", label: "สร้างโพสต์" },
  { href: "/dashboard/ocr", label: "OCR" },
  { href: "/dashboard/similar", label: "สินค้าใกล้เคียง" },
  { href: "/dashboard/settings", label: "ตั้งค่า" },
  { href: "/dashboard/hyperframes", label: "วิดีโอ" },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/70 bg-white/90 px-2 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden" aria-label="เมนูหลักบนมือถือ">
      <div className="grid grid-cols-4 gap-1 text-center text-[11px] font-medium text-slate-600">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-xl px-2 py-2 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300">
            {link.label}
          </Link>
        ))}
      </div>
      <p className="mt-1 px-1 text-[10px] text-slate-500">เมนูนี้เน้นงานเก็บสินค้า, สร้างคอนเทนต์, OCR และวิดีโอ สำหรับมือถือ</p>
    </nav>
  );
}
