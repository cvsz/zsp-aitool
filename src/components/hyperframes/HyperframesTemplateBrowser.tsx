"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { hyperframesTemplatePresets, templateCategories, type HyperframesTemplatePreset } from "@/lib/hyperframes/template-marketplace";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = { onSelect: (preset: HyperframesTemplatePreset) => void };

const categoryLabel: Record<(typeof templateCategories)[number], string> = {
  product_showcase: "Product Showcase",
  discount_alert: "Discount Alert",
  comparison: "Comparison",
  testimonial_style: "Testimonial-Style (Safe)",
  social_short_cut: "Short-Form Social",
};

export function HyperframesTemplateBrowser({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | (typeof templateCategories)[number]>("all");

  const filtered = useMemo(() => hyperframesTemplatePresets.filter((preset) => {
    const categoryMatch = category === "all" || preset.category === category;
    const text = `${preset.title} ${preset.description} ${preset.tags.join(" ")}`.toLowerCase();
    return categoryMatch && (!query.trim() || text.includes(query.trim().toLowerCase()));
  }), [category, query]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Video Template Marketplace</CardTitle>
            <CardDescription>เลือก Preset สำเร็จรูปสำหรับวิดีโอ 9:16 ที่ผ่านเกณฑ์ความปลอดภัยแล้ว</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 ค้นหา Template..."
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-44"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {templateCategories.map((item) => (
                <option key={item} value={item}>{categoryLabel[item]}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((preset) => (
            <article
              key={preset.id}
              className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700 mb-3">
                  <Image
                    src={preset.previewImage}
                    alt={preset.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {preset.title}
                  </h3>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    {preset.defaultAspectRatio}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs font-semibold"
                  onClick={() => onSelect(preset)}
                >
                  ⚡ นำไปใช้งาน
                </Button>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
