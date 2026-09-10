"use client";

import type { PromptTemplate } from "@/schemas/template.schema";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

type Props = {
  template: PromptTemplate;
  onSelect: (t: PromptTemplate) => void;
  onDelete: (t: PromptTemplate) => void;
  onDuplicate: (t: PromptTemplate) => void;
};

export function TemplateCard({ template, onSelect, onDelete, onDuplicate }: Props) {
  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-md flex flex-col justify-between"
      onClick={() => onSelect(template)}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(template); }}
      tabIndex={0}
      role="button"
      aria-label={template.name}
    >
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {template.name}
          </h3>
          {template.isDefault ? (
            <StatusBadge label="Default" tone="info" />
          ) : null}
        </div>
        <p className="line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {template.content}
        </p>
      </div>

      <div className="flex items-center justify-between p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <Button
          size="sm"
          variant="secondary"
          className="text-xs"
          onClick={(e) => { e.stopPropagation(); onSelect(template); }}
        >
          ✏️ แก้ไข
        </Button>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={(e) => { e.stopPropagation(); onDuplicate(template); }}
          >
            📋 Copy
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            onClick={(e) => { e.stopPropagation(); onDelete(template); }}
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
}
