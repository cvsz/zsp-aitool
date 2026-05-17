import Link from "next/link";

const menus = [
  ["ภาพรวม", "/dashboard"],
  ["คลังสินค้า", "/dashboard/products"],
  ["เพิ่มสินค้า", "/dashboard/products/new"],
  ["AI Generator", "/dashboard/generator"],
  ["ประวัติคอนเทนต์", "/dashboard/content-history"],
  ["Prompt Templates", "/dashboard/templates"],
  ["OCR Tools", "/dashboard/ocr"],
  ["สินค้าที่คล้ายกัน", "/dashboard/similar"],
  ["ตั้งค่า", "/dashboard/settings"]
] as const;

export function Sidebar() {
  return <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 md:block">{menus.map(([label, href]) => <Link key={href} href={href} className="mb-1 block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">{label}</Link>)}</aside>;
}
