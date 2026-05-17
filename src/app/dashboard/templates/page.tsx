"use client";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageTitle } from "@/components/ui/PageTitle";
import { Toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const { data, loading, error, refetch } = useApi<unknown[]>("/api/templates");
  const { toast, showToast } = useToast();

  return (
    <section>
      <PageTitle title="Prompt Templates" subtitle="เชื่อมต่อข้อมูลผ่าน API client" />
      <button className="mb-4 rounded border px-3 py-2 text-sm" onClick={() => { void refetch(); showToast("รีเฟรชข้อมูลแล้ว", "success"); }}>รีเฟรช</button>
      {loading ? <LoadingSpinner /> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">เกิดข้อผิดพลาด: {error}</div> : null}
      {!loading && !error && (!data || data.length === 0) ? <EmptyState title="ยังไม่มีข้อมูล" description="เมื่อมีข้อมูลจาก API จะแสดงที่นี่" /> : null}
      {!loading && !error && data && data.length > 0 ? <pre className="overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(data, null, 2)}</pre> : null}
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </section>

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
