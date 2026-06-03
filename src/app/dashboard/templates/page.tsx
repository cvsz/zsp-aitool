"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateEditorModal } from "@/components/templates/TemplateEditorModal";
import type { PromptTemplate } from "@/schemas/template.schema";

type ApiResponse<T> = { ok: boolean; data: T };
type BrandKit = { brandColors: string[]; fontPreference: string | null; logoUrl: string | null; watermarkText: string | null; defaultCTA: string | null; defaultAspectRatio: "9:16" | "1:1" | "16:9" | null };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [search, setSearch] = useState("");
  const [brandKit, setBrandKit] = useState<BrandKit>({ brandColors: [], fontPreference: null, logoUrl: null, watermarkText: null, defaultCTA: null, defaultAspectRatio: null });
  const [showBrandKit, setShowBrandKit] = useState(false);

  const loadTemplates = useCallback(async () => {
    const response = await fetch("/api/templates");
    const json = (await response.json()) as ApiResponse<PromptTemplate[]>;
    setTemplates(json.data ?? []);
  }, []);

  useEffect(() => {
    void loadTemplates();
    void (async () => {
      const response = await fetch("/api/hyperframes/brand-kit");
      const json = (await response.json()) as ApiResponse<BrandKit>;
      if (json?.data) setBrandKit(json.data);
    })();
  }, [loadTemplates]);

  const filtered = useMemo(
    () => templates.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase())),
    [templates, search],
  );

  const handleSave = useCallback(
    async (payload: { name: string; content: string }) => {
      if (editing) {
        await fetch(`/api/templates/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch("/api/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      setEditing(null);
      await loadTemplates();
    },
    [editing, loadTemplates],
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Template Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            จัดการและสร้างเทมเพลตสำหรับคอนเทนต์ Affiliate
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            onClick={() => setShowBrandKit((v) => !v)}
          >
            Brand Kit
          </button>
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            onClick={() => setEditing({} as PromptTemplate)}
          >
            + เทมเพลตใหม่
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            onClick={async () => { await fetch("/api/templates/restore-defaults", { method: "POST" }); await loadTemplates(); }}
          >
            คืนค่าเริ่มต้น
          </button>
        </div>
      </header>

      {showBrandKit && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-emerald-900">Brand Kit Defaults</h3>
              <p className="mt-0.5 text-xs text-emerald-700">ตั้งค่าให้เทมเพลตสอดคล้องแบรนด์</p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
              onClick={async () => { await fetch("/api/hyperframes/brand-kit", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brandKit) }); }}
            >
              บันทึก
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-emerald-800">Brand Colors</label>
              <input className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" value={brandKit.brandColors.join(",")} onChange={(e) => setBrandKit((v) => ({ ...v, brandColors: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))} placeholder="#22C55E,#0F172A" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-emerald-800">Font</label>
              <input className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" value={brandKit.fontPreference ?? ""} onChange={(e) => setBrandKit((v) => ({ ...v, fontPreference: e.target.value || null }))} placeholder="Font preference" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-emerald-800">Logo URL</label>
              <input className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" value={brandKit.logoUrl ?? ""} onChange={(e) => setBrandKit((v) => ({ ...v, logoUrl: e.target.value || null }))} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-emerald-800">Watermark</label>
              <input className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" value={brandKit.watermarkText ?? ""} onChange={(e) => setBrandKit((v) => ({ ...v, watermarkText: e.target.value || null }))} placeholder="Watermark text" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-emerald-800">Default CTA</label>
              <input className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" value={brandKit.defaultCTA ?? ""} onChange={(e) => setBrandKit((v) => ({ ...v, defaultCTA: e.target.value || null }))} placeholder="Default CTA" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-emerald-800">Aspect Ratio</label>
              <select className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" value={brandKit.defaultAspectRatio ?? "9:16"} onChange={(e) => setBrandKit((v) => ({ ...v, defaultAspectRatio: e.target.value as BrandKit["defaultAspectRatio"] }))}>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
              </select>
            </div>
          </div>
        </section>
      )}

      <div className="relative">
        <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          placeholder="ค้นหาเทมเพลต..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-12">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
            📄
          </div>
          <p className="text-sm font-medium text-slate-600">
            {search ? "ไม่พบเทมเพลตที่ค้นหา" : "ยังไม่มีเทมเพลต"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {search ? "ลองเปลี่ยนคำค้นหา" : "กด + เทมเพลตใหม่ เพื่อเริ่มสร้าง"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onSelect={setEditing}
              onDelete={async (template) => {
                await fetch(`/api/templates/${template.id}`, { method: "DELETE" });
                await loadTemplates();
              }}
              onDuplicate={async (template) => {
                await fetch(`/api/templates/${template.id}/duplicate`, { method: "POST" });
                await loadTemplates();
              }}
            />
          ))}
        </div>
      )}

      {editing !== null && (
        <TemplateEditorModal
          template={editing.id ? editing : null}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
