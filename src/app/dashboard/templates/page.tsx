"use client";

import { useEffect, useMemo, useState } from "react";

import { PromptTemplateEditor } from "@/components/templates/PromptTemplateEditor";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import type { PromptTemplate } from "@/schemas/template.schema";

type ApiResponse<T> = { ok: boolean; data: T };
type BrandKit = { brandColors: string[]; fontPreference: string | null; logoUrl: string | null; watermarkText: string | null; defaultCTA: string | null; defaultAspectRatio: "9:16" | "1:1" | "16:9" | null };

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
  const [brandKit, setBrandKit] = useState<BrandKit>({ brandColors: [], fontPreference: null, logoUrl: null, watermarkText: null, defaultCTA: null, defaultAspectRatio: null });

  const loadTemplates = async () => {
    const response = await fetch("/api/templates");
    const json = (await response.json()) as ApiResponse<PromptTemplate[]>;
    setTemplates(json.data ?? []);
  };

  useEffect(() => {
    void loadTemplates();
    void (async () => {
      const response = await fetch("/api/hyperframes/brand-kit");
      const json = (await response.json()) as ApiResponse<BrandKit>;
      if (json?.data) setBrandKit(json.data);
    })();
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
          <section className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="font-semibold text-emerald-900">Brand Kit Defaults</h3>
            <p className="text-xs text-emerald-800">ตั้งค่าเพื่อให้ prompt และงานคอนเทนต์สอดคล้องแบรนด์มากขึ้น โดยไม่เปิดเผยข้อมูลลับ</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input className="rounded border p-2 text-sm" value={brandKit.brandColors.join(",")} onChange={(e) => setBrandKit((v) => ({ ...v, brandColors: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))} placeholder="#22C55E,#0F172A" />
              <input className="rounded border p-2 text-sm" value={brandKit.fontPreference ?? ""} onChange={(e) => setBrandKit((v) => ({ ...v, fontPreference: e.target.value || null }))} placeholder="Font preference" />
              <input className="rounded border p-2 text-sm" value={brandKit.logoUrl ?? ""} onChange={(e) => setBrandKit((v) => ({ ...v, logoUrl: e.target.value || null }))} placeholder="Logo URL (https://...)" />
              <input className="rounded border p-2 text-sm" value={brandKit.watermarkText ?? ""} onChange={(e) => setBrandKit((v) => ({ ...v, watermarkText: e.target.value || null }))} placeholder="Watermark text" />
              <input className="rounded border p-2 text-sm" value={brandKit.defaultCTA ?? ""} onChange={(e) => setBrandKit((v) => ({ ...v, defaultCTA: e.target.value || null }))} placeholder="Default CTA" />
              <select className="rounded border p-2 text-sm" value={brandKit.defaultAspectRatio ?? "9:16"} onChange={(e) => setBrandKit((v) => ({ ...v, defaultAspectRatio: e.target.value as BrandKit["defaultAspectRatio"] }))}><option value="9:16">9:16</option><option value="1:1">1:1</option><option value="16:9">16:9</option></select>
            </div>
            <button className="rounded bg-emerald-700 px-3 py-2 text-sm text-white" type="button" onClick={async () => { await fetch("/api/hyperframes/brand-kit", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brandKit) }); }}>บันทึก Brand Kit</button>
          </section>
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
