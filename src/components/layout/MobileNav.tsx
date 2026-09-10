"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileLinks = [
  { href: "/dashboard", label: "ภาพรวม", icon: "🏠" },
  { href: "/dashboard/products", label: "สินค้า", icon: "🛍️" },
  { href: "/dashboard/generator", label: "เขียนรีวิว", icon: "✍️" },
  { href: "/dashboard/hyperframes", label: "วิดีโอ", icon: "🎬" },
  { href: "/dashboard/settings", label: "ตั้งค่า", icon: "⚙️" },
];

export function MobileNav() {
  const pathname = usePathname() ?? "";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 px-3 py-2 shadow-lg backdrop-blur-xl md:hidden transition-colors"
      aria-label="เมนูหลักบนมือถือ"
    >
      <div className="grid grid-cols-5 gap-1 text-center">
        {mobileLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center rounded-xl py-1.5 transition ${
                active
                  ? "bg-slate-100 text-sky-600 dark:bg-slate-800 dark:text-sky-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span className="text-[10px] mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
