"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

export type OCRResult = {
  confidence?: number;
  rawText?: string;
  fields?: {
    title?: string;
    price?: number;
    discount?: string;
    rating?: number;
    soldCount?: number;
    descriptionSnippets?: string[];
  };
};

export function OCRResultReview({ result }: { result: OCRResult | null }) {
  const initial = useMemo(
    () => ({
      title: result?.fields?.title ?? "",
      price: result?.fields?.price?.toString() ?? "",
      discount: result?.fields?.discount ?? "",
      rating: result?.fields?.rating?.toString() ?? "",
      soldCount: result?.fields?.soldCount?.toString() ?? "",
      descriptionSnippets: (result?.fields?.descriptionSnippets ?? []).join("\n"),
    }),
    [result],
  );

  const [form, setForm] = useState(initial);

  if (!result) return null;

  const confidencePercent = result.confidence ? Math.round(result.confidence * 100) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ผลการสแกน OCR และตรวจสอบข้อมูล</CardTitle>
          {confidencePercent !== null ? (
            <StatusBadge
              label={`ความมั่นใจ: ${confidencePercent}%`}
              tone={confidencePercent > 80 ? "success" : "warning"}
            />
          ) : null}
        </div>
        <CardDescription>
          กรุณาตรวจทานและแก้ไขข้อมูลให้ตรงกับภาพจริงก่อนบันทึกเข้าสู่คลังสินค้า
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            ชื่อสินค้า (Title)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            ราคา (Price ฿)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            ส่วนลด (Discount)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              value={form.discount}
              onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            คะแนนรีวิว (Rating)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              value={form.rating}
              onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            จำนวนขายแล้ว (Sold)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              value={form.soldCount}
              onChange={(e) => setForm((prev) => ({ ...prev, soldCount: e.target.value }))}
            />
          </label>
        </div>

        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
          รายละเอียดและสเปกที่ดึงได้ (Description Snippets)
          <textarea
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100"
            value={form.descriptionSnippets}
            onChange={(e) => setForm((prev) => ({ ...prev, descriptionSnippets: e.target.value }))}
          />
        </label>

        <div className="flex gap-2 pt-2">
          <Button variant="primary" size="md">
            บันทึกเป็นสินค้าใหม่ 🛍️
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(form, null, 2));
            }}
          >
            📋 คัดลอก JSON สเปก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
