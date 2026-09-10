import { Tone } from "@prisma/client";

const toneIcons: Record<string, string> = {
  FRIENDLY: "😊",
  PROFESSIONAL: "👔",
  URGENT: "🔥",
  INFORMATIVE: "📊",
  HUMOROUS: "😄",
  STORYTELLER: "📖",
};

export function ToneSelector({ value, onChange }: { value: Tone; onChange: (v: Tone) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.values(Tone).map((tone) => {
        const selected = value === tone;
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selected
                ? "bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 border-slate-900 dark:border-sky-500 shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
            }`}
          >
            <span>{toneIcons[tone] || "✨"}</span>
            <span>{tone}</span>
          </button>
        );
      })}
    </div>
  );
}
