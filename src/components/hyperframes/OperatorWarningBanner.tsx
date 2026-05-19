export function OperatorWarningBanner({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <h2 className="font-semibold text-amber-900">คำเตือนสถานะระบบ</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
