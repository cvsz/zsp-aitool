import { Platform } from "@prisma/client";

const platformIcons: Record<string, string> = {
  FACEBOOK: "📘",
  INSTAGRAM: "📸",
  THREADS: "🧵",
  X: "✖️",
  BLOG: "📝",
  SEO_ARTICLE: "🔍",
  COMMENT: "💬",
  SHORT_CAPTION: "⚡",
};

export function PlatformSelector({ value, onChange, multiple = false }: { value: Platform[]; onChange: (v: Platform[]) => void; multiple?: boolean }) {
  const items = Object.values(Platform);

  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((p) => {
        const selected = value.includes(p);
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(multiple ? (selected ? value.filter((x) => x !== p) : [...value, p]) : [p])}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selected
                ? "bg-sky-500 text-slate-950 border-sky-500 shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500"
            }`}
          >
            <span>{platformIcons[p] || "🌐"}</span>
            <span>{p}</span>
          </button>
        );
      })}
    </div>
  );
}
