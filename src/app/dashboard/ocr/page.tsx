"use client";

import { useState } from "react";
import type { OCRResult } from "@/components/ocr/OCRResultReview";
import { OCRResultReview } from "@/components/ocr/OCRResultReview";
import { OCRUploadBox } from "@/components/ocr/OCRUploadBox";

export default function OCRDashboardPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">OCR เครื่องมืออ่านข้อมูลจากภาพสินค้า</h1>
      <OCRUploadBox
        onExtracted={(payload) => {
          setJobId(payload.jobId);
          setResult(payload.result as OCRResult | null);
        }}
      />
      {jobId ? <p className="text-xs text-gray-500">OCR Job ID: {jobId}</p> : null}
      <OCRResultReview result={result} />
    </main>
  );
}
