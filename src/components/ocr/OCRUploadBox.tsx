"use client";

import { useState } from "react";

type OCRUploadBoxProps = {
  onExtracted: (payload: { jobId: string; result: unknown }) => void;
};

export function OCRUploadBox({ onExtracted }: OCRUploadBoxProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (file: File | undefined) => {
    if (!file) return;
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
        throw new Error(json.error ?? "OCR failed");
      }

      onExtracted({ jobId: json.jobId, result: json.result });
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการทำ OCR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold">อัปโหลดภาพสินค้า</h2>
      <p className="mb-3 mt-1 text-sm text-gray-600">ผล OCR อาจคลาดเคลื่อน โปรดตรวจสอบก่อนบันทึกสินค้า</p>
      <input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0])} />
      {loading ? <p className="mt-2 text-sm">กำลังประมวลผล OCR...</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
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
