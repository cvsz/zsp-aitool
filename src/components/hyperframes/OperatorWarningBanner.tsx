export function OperatorWarningBanner({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-amber-400">คำเตือนสถานะระบบ</h2>
          <p className="mt-1 text-xs text-amber-200">แสดงเฉพาะข้อมูลสถานะที่ปลอดภัย ไม่มี path ภายใน ไม่มี secrets และไม่มี systemd controls จาก UI</p>
        </div>
        <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-semibold text-amber-400">read-only</span>
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-amber-100 md:grid-cols-2">
        {items.map((item) => <li key={item} className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2">{item}</li>)}
      </ul>
    </section>
  );
}
