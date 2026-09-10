"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateEditorModal } from "@/components/templates/TemplateEditorModal";
import type { PromptTemplate } from "@/schemas/template.schema";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

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
    <div className="space-y-6">
      <PageHeader
        title="Prompt Template Studio"
        subtitle="จัดการและสร้างเทมเพลตคำสั่ง AI สำหรับคอนเทนต์รีวิวสินค้าและสคริปต์วิดีโอ"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowBrandKit((v) => !v)}
            >
              🎨 Brand Kit
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setEditing({} as PromptTemplate)}
            >
              ➕ เทมเพลตใหม่
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={async () => {
                await fetch("/api/templates/restore-defaults", { method: "POST" });
                await loadTemplates();
              }}
            >
              🔄 คืนค่าเริ่มต้น
            </Button>
          </div>
        }
      />

      {showBrandKit && (
        <Card tone="success">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">Brand Kit Defaults</h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-400">ตั้งค่าเพื่อให้คอนเทนต์และวิดีโอสอดคล้องกับแบรนด์</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  await fetch("/api/hyperframes/brand-kit", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(brandKit),
                  });
                }}
              >
                บันทึก Brand Kit
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Brand Colors</label>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  value={brandKit.brandColors.join(",")}
                  onChange={(e) => setBrandKit((v) => ({ ...v, brandColors: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))}
                  placeholder="#22C55E,#0F172A"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Font</label>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  value={brandKit.fontPreference ?? ""}
                  onChange={(e) => setBrandKit((v) => ({ ...v, fontPreference: e.target.value || null }))}
                  placeholder="Prompt, Kanit"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Logo URL</label>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  value={brandKit.logoUrl ?? ""}
                  onChange={(e) => setBrandKit((v) => ({ ...v, logoUrl: e.target.value || null }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Filter */}
      <Card>
        <CardContent className="p-3">
          <input
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="🔍 ค้นหาเทมเพลตคำสั่ง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
          <span className="text-3xl mb-2">📚</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {search ? "ไม่พบเทมเพลตที่ตรงกับคำค้นหา" : "ยังไม่มีเทมเพลต"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            กดปุ่ม "+ เทมเพลตใหม่" หรือ "คืนค่าเริ่มต้น" เพื่อเริ่มต้นใช้งาน
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
    </div>
  );
}
