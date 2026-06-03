type StatusCard = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

const toneClass: Record<NonNullable<StatusCard["tone"]>, string> = {
  neutral: "border-white/10 bg-cyber-surface text-slate-100",
  success: "border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan",
  warning: "border-amber-400/50 bg-amber-400/10 text-amber-400",
  danger: "border-rose-400/50 bg-rose-400/10 text-rose-400",
  info: "border-cyber-violet/50 bg-cyber-violet/10 text-cyber-violet",
};

export function HyperFramesStatusGrid({ cards }: { cards: StatusCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className={`rounded-2xl border p-4 shadow-sm ${toneClass[card.tone ?? "neutral"]}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{card.label}</p>
            <span className="rounded-full bg-white/10 text-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">safe</span>
          </div>
          <p className="mt-3 text-2xl font-bold">{card.value}</p>
          {card.hint ? <p className="mt-2 text-xs leading-5 opacity-75">{card.hint}</p> : null}
        </article>
      ))}
    </div>
  );
}
