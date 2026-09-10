export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
      </div>
      <div className="h-28 animate-pulse rounded-3xl bg-slate-200/80 dark:bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
        ))}
      </div>
    </div>
  );
}
