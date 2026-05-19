export function AdminGuardNotice({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}
