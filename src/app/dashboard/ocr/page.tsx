"use client";

import { useState } from "react";
import type { OCRResult } from "@/components/ocr/OCRResultReview";
import { OCRResultReview } from "@/components/ocr/OCRResultReview";
import { OCRUploadBox } from "@/components/ocr/OCRUploadBox";
import { PageHeader } from "@/components/ui/PageHeader";

export default function OCRDashboardPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Product Spec OCR Scanner"
        subtitle="ดึงข้อมูลสเปกสินค้า ราคา ส่วนลด และรายละเอียดจากรูปถ่ายเพื่อนำไปใช้สร้างคอนเทนต์หรือบันทึกสินค้าใหม่"
      />
      <OCRUploadBox
        onExtracted={(payload) => {
          setJobId(payload.jobId);
          setResult(payload.result as OCRResult | null);
        }}
      />
      {jobId ? (
        <p className="text-xs text-slate-400 font-mono">
          Job Reference ID: {jobId}
        </p>
      ) : null}
      <OCRResultReview result={result} />
    </div>
  );
}
