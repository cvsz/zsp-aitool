import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold">ZSP AI Tool</h1>
      <p className="mt-3 max-w-2xl text-slate-600">เครื่องมือช่วยทำคอนเทนต์ Affiliate สำหรับ Shopee แบบครบในที่เดียว</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["เก็บสินค้า", "สร้างคอนเทนต์ AI", "จัดการ Prompt"].map((f) => <div key={f} className="rounded-xl border bg-white p-4">{f}</div>)}
      </div>
      <Link href="/dashboard" className="mt-8 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">เข้าสู่แดชบอร์ด</Link>
    </main>
  );
}
