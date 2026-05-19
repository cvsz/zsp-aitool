export function HyperFramesStatusGrid({ cards }: { cards: Array<{ label: string; value: string; hint?: string }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{card.label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{card.value}</p>
          {card.hint ? <p className="mt-1 text-xs text-slate-500">{card.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
