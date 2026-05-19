type Row = { key: string; value: string };

export function AdminPlaceholderTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-2 text-sm">
            <p className="text-slate-600">{row.key}</p>
            <p className="font-medium text-slate-900">{row.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
