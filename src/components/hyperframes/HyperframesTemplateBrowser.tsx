"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { hyperframesTemplatePresets, templateCategories, type HyperframesTemplatePreset } from "@/lib/hyperframes/template-marketplace";

type Props = { onSelect: (preset: HyperframesTemplatePreset) => void };

const categoryLabel: Record<(typeof templateCategories)[number], string> = {
  product_showcase: "Product showcase",
  discount_alert: "Discount alert",
  comparison: "Comparison",
  testimonial_style: "Testimonial-style (safe)",
  social_short_cut: "Short-form social",
};

export function HyperframesTemplateBrowser({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | (typeof templateCategories)[number]>("all");

  const filtered = useMemo(() => hyperframesTemplatePresets.filter((preset) => {
    const categoryMatch = category === "all" || preset.category === category;
    const text = `${preset.title} ${preset.description} ${preset.tags.join(" ")}`.toLowerCase();
    return categoryMatch && (!query.trim() || text.includes(query.trim().toLowerCase()));
  }), [category, query]);

  return <section className="cyber-card p-5">
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-56">
        <h2 className="text-lg font-bold text-slate-100">Template Marketplace Lite</h2>
        <p className="text-sm text-slate-400">เลือก preset ที่ผ่าน safety guardrails เพื่อเริ่ม composition ได้เร็วขึ้น</p>
      </div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหา template" className="w-full rounded-xl border border-white/10 bg-cyber-bg px-3 py-2 text-sm text-slate-100 md:w-64 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none" />
      <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="rounded-xl border border-white/10 bg-cyber-bg px-3 py-2 text-sm text-slate-100 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none">
        <option value="all">ทุกหมวดหมู่</option>
        {templateCategories.map((item) => <option key={item} value={item}>{categoryLabel[item]}</option>)}
      </select>
    </div>

    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((preset) => <article key={preset.id} className="rounded-2xl border border-white/10 bg-cyber-surface2 p-3">
        <Image src={preset.previewImage} alt={preset.title} width={480} height={270} className="h-40 w-full rounded-xl border border-white/5 object-cover opacity-80 mix-blend-screen" />
        <h3 className="mt-3 text-sm font-bold text-slate-100">{preset.title}</h3>
        <p className="mt-1 text-xs text-slate-400">{preset.description}</p>
        <p className="mt-2 text-xs text-cyber-cyan">{categoryLabel[preset.category]}</p>
        <button type="button" className="mt-3 w-full cyber-button-secondary" onClick={() => onSelect(preset)}>ใช้ template นี้</button>
      </article>)}
    </div>
  </section>;
}
