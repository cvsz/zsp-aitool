import Link from "next/link";

export function MobileNav() {
  return <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white p-2 md:hidden"><div className="grid grid-cols-5 gap-1 text-center text-xs"><Link href="/dashboard">ภาพรวม</Link><Link href="/dashboard/products">สินค้า</Link><Link href="/dashboard/generator">AI</Link><Link href="/dashboard/hyperframes">วิดีโอ</Link><Link href="/dashboard/settings">ตั้งค่า</Link></div></nav>;
}
