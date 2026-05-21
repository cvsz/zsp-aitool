import Link from "next/link";

const DATASETS = [
  { key: "products", label: "สินค้า" },
  { key: "affiliate-links", label: "ลิงก์แอฟฟิลิเอต" },
  { key: "social-drafts", label: "ฉบับร่างโซเชียล" },
  { key: "content-history", label: "ประวัติคอนเทนต์" },
] as const;

export default function ExportCenterPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">ศูนย์ส่งออกข้อมูล v2</h1>
      <p className="text-sm text-slate-600">เลือกชุดข้อมูล รูปแบบไฟล์ และตัวกรองก่อนส่งออก</p>
      <section className="rounded-lg border p-4">
        <h2 className="font-medium">ดาวน์โหลดทันที (ขนาดเล็ก)</h2>
        <ul className="mt-3 space-y-2">
          {DATASETS.map((item) => (
            <li key={item.key} className="flex items-center justify-between rounded border p-3">
              <span>{item.label}</span>
              <Link className="rounded bg-slate-900 px-3 py-1 text-white" href={`/api/export/v2/${item.key}?format=csv`}>
                ส่งออก CSV
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border p-4">
        <h2 className="font-medium">งานส่งออกเบื้องหลัง</h2>
        <p className="text-sm text-slate-600">เมื่อข้อมูลจำนวนมาก ระบบจะสร้าง Export Job เพื่อดาวน์โหลดภายหลัง</p>
        <p className="mt-2 text-xs text-slate-500">ดูรายการที่ /api/export/v2/jobs</p>
      </section>
    </main>
  );
}
