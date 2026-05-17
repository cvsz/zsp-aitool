"use client";

import { useEffect, useMemo, useState } from "react";

import { PromptTemplateEditor } from "@/components/templates/PromptTemplateEditor";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import type { PromptTemplate } from "@/schemas/template.schema";

type ApiResponse<T> = { ok: boolean; data: T };

const sample = {
  productTitle: "ลำโพงบลูทูธพกพา",
  price: "899 บาท",
  description: "เสียงดี แบตอึด พกง่าย",
  rating: "4.9/5",
  reviewSummary: "รีวิวชมเรื่องเสียงและความคุ้มค่า",
  affiliateLink: "https://example.com/aff",
  platform: "Facebook",
  tone: "เป็นกันเอง",
  language: "th",
  ctaStyle: "ชวนคลิกแบบสุภาพ",
  hashtags: "#ลำโพง #โปรโมชัน",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const [preview, setPreview] = useState<{ rendered: string; variablesUsed: string[] } | null>(null);

  const loadTemplates = async () => {
    const response = await fetch("/api/templates");
    const json = (await response.json()) as ApiResponse<PromptTemplate[]>;
    setTemplates(json.data ?? []);
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const previewContent = useMemo(() => selected?.content ?? "", [selected]);

  useEffect(() => {
    if (!previewContent) return;
    void (async () => {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", content: previewContent, sample }),
      });
      const json = (await response.json()) as ApiResponse<{ rendered: string; variablesUsed: string[] }>;
      setPreview(json.data);
    })();
  }, [previewContent]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prompt Templates</h1>
        <button className="rounded border px-3 py-2" onClick={async () => { await fetch("/api/templates/restore-defaults", { method: "POST" }); await loadTemplates(); }} type="button">Restore Defaults</button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <TemplateList
          templates={templates}
          onSelect={setSelected}
          onDelete={async (template) => {
            await fetch(`/api/templates/${template.id}`, { method: "DELETE" });
            await loadTemplates();
          }}
          onDuplicate={async (template) => {
            await fetch(`/api/templates/${template.id}/duplicate`, { method: "POST" });
            await loadTemplates();
          }}
        />

        <div className="space-y-4">
          <PromptTemplateEditor
            initialName={selected?.name}
            initialContent={selected?.content}
            onSave={async (payload) => {
              if (selected) {
                await fetch(`/api/templates/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
              } else {
                await fetch("/api/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
              }
              setSelected(null);
              await loadTemplates();
            }}
          />
          {preview ? <TemplatePreview rendered={preview.rendered} variablesUsed={preview.variablesUsed} /> : null}
        </div>
      </div>
    </main>
  );
}
