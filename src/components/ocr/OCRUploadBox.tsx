"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AlertBanner } from "@/components/ui/AlertBanner";

type OCRUploadBoxProps = {
  onExtracted: (payload: { jobId: string; result: unknown }) => void;
};

export function OCRUploadBox({ onExtracted }: OCRUploadBoxProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onFileChange = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);

    try {
      const imageBase64 = await fileToBase64(file);
      const response = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "OCR ประมวลผลภาพไม่สำเร็จ");
      }

      onExtracted({ jobId: json.jobId, result: json.result });
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการทำ OCR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>อัปโหลดภาพสินค้าเพื่อสแกนสเปก</CardTitle>
        <CardDescription>
          รองรับภาพถ่ายสินค้า ป้ายราคา หรือตารางสเปก (JPG, PNG, WebP)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 p-8 text-center cursor-pointer transition hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-slate-800/80">
          <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">📸</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {fileName ? `ไฟล์ที่เลือก: ${fileName}` : "คลิกหรือลากไฟล์ภาพมาวางที่นี่"}
          </span>
          <span className="text-xs text-slate-400 mt-1">ขนาดสูงสุด 10MB ต่อภาพ</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
        </label>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 text-sm">
            <LoadingSpinner />
            <span>กำลังอ่านตัวอักษรและวิเคราะห์ฟิลด์สเปกสินค้า...</span>
          </div>
        ) : null}

        {error ? (
          <AlertBanner
            title="เกิดข้อผิดพลาด"
            description={error}
            variant="error"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}
