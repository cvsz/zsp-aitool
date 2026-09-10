export function OperatorWarningBanner({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/20 p-4 sm:p-5 shadow-sm transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <span>🛡️</span> คำเตือนความปลอดภัย & มาตรฐานระบบ
          </h2>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
            ระบบจำกัดการเข้าถึงอย่างปลอดภัย ไม่เปิดเผย Path ภายใน หรือ Credentials ออกสู่เบราว์เซอร์
          </p>
        </div>
        <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
          Read-only Mode
        </span>
      </div>
      <ul className="mt-3 grid gap-2 text-xs text-amber-900 dark:text-amber-300 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-white/60 dark:bg-slate-900/60 px-3 py-2 leading-relaxed">
            • {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
