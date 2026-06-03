"use client";

import type { PromptTemplate } from "@/schemas/template.schema";

type Props = {
  template: PromptTemplate;
  onSelect: (t: PromptTemplate) => void;
  onDelete: (t: PromptTemplate) => void;
  onDuplicate: (t: PromptTemplate) => void;
};

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

export function TemplateCard({ template, onSelect, onDelete, onDuplicate }: Props) {
  const color = hashColor(template.name);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      onClick={() => onSelect(template)}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(template); }}
      tabIndex={0}
      role="button"
      aria-label={template.name}
    >
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-900">{template.name}</h3>
          <div className="flex shrink-0 gap-1">
            {template.isDefault && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                Default
              </span>
            )}
          </div>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{template.content}</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-end gap-1 bg-white/90 p-2 backdrop-blur-sm transition-transform group-hover:translate-y-0">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-slate-700"
          onClick={(e) => { e.stopPropagation(); onSelect(template); }}
        >
          แก้ไข
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
          onClick={(e) => { e.stopPropagation(); onDuplicate(template); }}
        >
          Copy
        </button>
        <button
          type="button"
          className="rounded-lg border border-red-100 px-3 py-1.5 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50"
          onClick={(e) => { e.stopPropagation(); onDelete(template); }}
        >
          ลบ
        </button>
      </div>
    </div>
  );
}
