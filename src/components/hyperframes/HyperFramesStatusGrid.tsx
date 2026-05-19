type StatusCard = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

const toneClass: Record<NonNullable<StatusCard["tone"]>, string> = {
  neutral: "border-slate-200 bg-white text-slate-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  danger: "border-rose-200 bg-rose-50 text-rose-950",
  info: "border-indigo-200 bg-indigo-50 text-indigo-950",
};

export function HyperFramesStatusGrid({ cards }: { cards: StatusCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className={`rounded-2xl border p-4 shadow-sm ${toneClass[card.tone ?? "neutral"]}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{card.label}</p>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">safe</span>
          </div>
          <p className="mt-3 text-2xl font-bold">{card.value}</p>
          {card.hint ? <p className="mt-2 text-xs leading-5 opacity-75">{card.hint}</p> : null}
        </article>
      ))}
    </div>
  );
}
