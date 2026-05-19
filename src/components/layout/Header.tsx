"use client";
import { usePathname } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

const sectionTitles: Record<string, string> = {
  "/dashboard": "ภาพรวม",
  "/dashboard/products": "คลังสินค้า",
  "/dashboard/generator": "AI Generator",
  "/dashboard/hyperframes": "HyperFrames Studio",
};

export function Header() {
  const pathname = usePathname();
  const safePathname = pathname ?? "";
  const section = Object.entries(sectionTitles).find(([key]) => safePathname.startsWith(key))?.[1] ?? "แดชบอร์ด";

  return <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">ZSP Affiliate SaaS</p><p className="text-base font-semibold text-slate-900">{section}</p></div><div className="flex flex-wrap items-center gap-2"><input placeholder="ค้นหาโมดูล (เร็ว ๆ นี้)" className="w-52 rounded-lg border border-slate-200 px-3 py-2 text-sm" /><StatusBadge label="Production-safe" tone="success" /><button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">อัปเกรดแพ็กเกจ</button></div></div></header>;
}
