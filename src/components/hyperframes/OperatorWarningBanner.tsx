export function OperatorWarningBanner({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-amber-950">คำเตือนสถานะระบบ</h2>
          <p className="mt-1 text-xs text-amber-800">แสดงเฉพาะข้อมูลสถานะที่ปลอดภัย ไม่มี path ภายใน ไม่มี secrets และไม่มี systemd controls จาก UI</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-amber-800">read-only</span>
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-amber-900 md:grid-cols-2">
        {items.map((item) => <li key={item} className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2">{item}</li>)}
      </ul>
    </section>
  );
}
