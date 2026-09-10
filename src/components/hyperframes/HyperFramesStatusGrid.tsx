type StatusCard = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

const toneClass: Record<NonNullable<StatusCard["tone"]>, string> = {
  neutral: "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100",
  success: "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300",
  warning: "border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300",
  danger: "border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300",
  info: "border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/20 text-sky-900 dark:text-sky-300",
};

export function HyperFramesStatusGrid({ cards }: { cards: StatusCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${toneClass[card.tone ?? "neutral"]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{card.label}</p>
            <span className="rounded-full bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Safe
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold tracking-tight">{card.value}</p>
          {card.hint ? <p className="mt-1.5 text-xs opacity-75 leading-relaxed">{card.hint}</p> : null}
        </article>
      ))}
    </div>
  );
}
