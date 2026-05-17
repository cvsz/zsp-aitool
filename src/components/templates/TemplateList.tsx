"use client";

import type { PromptTemplate } from "@/schemas/template.schema";

type Props = {
  templates: PromptTemplate[];
  onSelect: (template: PromptTemplate) => void;
  onDelete: (template: PromptTemplate) => void;
  onDuplicate: (template: PromptTemplate) => void;
};

export function TemplateList({ templates, onSelect, onDelete, onDuplicate }: Props) {
  return (
    <div className="space-y-2">
      {templates.map((template) => (
        <article className="rounded-lg border p-3" key={template.id}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium">{template.name}</h3>
            {template.isDefault ? <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">Default</span> : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{template.content}</p>
          <div className="mt-3 flex gap-2 text-sm">
            <button className="rounded border px-2 py-1" onClick={() => onSelect(template)} type="button">แก้ไข</button>
            <button className="rounded border px-2 py-1" onClick={() => onDuplicate(template)} type="button">Duplicate</button>
            <button className="rounded border px-2 py-1 text-red-600" onClick={() => onDelete(template)} type="button">ลบ</button>
          </div>
        </article>
      ))}
    </div>
  );
}
