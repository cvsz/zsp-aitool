"use client";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageTitle } from "@/components/ui/PageTitle";
import { Toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const { data, loading, error, refetch } = useApi<unknown[]>("/api/ocr");
  const { toast, showToast } = useToast();

  return (
    <section>
      <PageTitle title="OCR Tools" subtitle="เชื่อมต่อข้อมูลผ่าน API client" />
      <button className="mb-4 rounded border px-3 py-2 text-sm" onClick={() => { void refetch(); showToast("รีเฟรชข้อมูลแล้ว", "success"); }}>รีเฟรช</button>
      {loading ? <LoadingSpinner /> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">เกิดข้อผิดพลาด: {error}</div> : null}
      {!loading && !error && (!data || data.length === 0) ? <EmptyState title="ยังไม่มีข้อมูล" description="เมื่อมีข้อมูลจาก API จะแสดงที่นี่" /> : null}
      {!loading && !error && data && data.length > 0 ? <pre className="overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(data, null, 2)}</pre> : null}
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </section>

import { useState } from "react";
import { OCRResultReview } from "@/components/ocr/OCRResultReview";
import { OCRUploadBox } from "@/components/ocr/OCRUploadBox";

export default function OCRDashboardPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">OCR เครื่องมืออ่านข้อมูลจากภาพสินค้า</h1>
      <OCRUploadBox
        onExtracted={(payload) => {
          setJobId(payload.jobId);
          setResult(payload.result);
        }}
      />
      {jobId ? <p className="text-xs text-gray-500">OCR Job ID: {jobId}</p> : null}
      <OCRResultReview result={result} />
    </main>
  );
}
