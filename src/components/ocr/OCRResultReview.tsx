"use client";

import { useMemo, useState } from "react";

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

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">ตรวจและแก้ไขผล OCR ก่อนบันทึก</h3>
      <p className="text-sm text-gray-600">ความมั่นใจโดยรวม: {result.confidence ? `${Math.round(result.confidence * 100)}%` : "ไม่มีข้อมูล"}</p>
      <div className="mt-3 grid gap-2">
        {Object.entries(form).map(([k, v]) => (
          <label key={k} className="text-sm">
            <span className="mb-1 block capitalize">{k}</span>
            <textarea
              className="w-full rounded border p-2"
              value={v}
              onChange={(e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))}
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-amber-700">หมายเหตุ: ห้ามเชื่อผล OCR โดยไม่ตรวจสอบด้วยสายตา</p>
    </div>
  );
}
