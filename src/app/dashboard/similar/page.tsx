"use client";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageTitle } from "@/components/ui/PageTitle";
import { Toast } from "@/components/ui/Toast";
import { SimilarProductCard } from "@/components/products/SimilarProductCard";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

type SimilarItem = { relatedProductId: string; score: number; reasons: string[] };

export default function Page() {
  const { data, loading, error, refetch } = useApi<SimilarItem[]>("/api/products/similar");
  const { toast, showToast } = useToast();

  return (
    <section>
      <PageTitle title="สินค้าที่คล้ายกัน" subtitle="แนะนำจากข้อมูลสินค้าที่คุณบันทึกไว้" />
      <button className="mb-4 rounded border px-3 py-2 text-sm" onClick={() => { void refetch(); showToast("รีเฟรชข้อมูลแล้ว", "success"); }}>รีเฟรช</button>
      {loading ? <LoadingSpinner /> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">เกิดข้อผิดพลาด: {error}</div> : null}
      {!loading && !error && (!data || data.length === 0) ? <EmptyState title="ข้อมูลยังไม่พอสำหรับจับคู่" description="เพิ่มรายละเอียดสินค้าให้ครบเพื่อให้ระบบวิเคราะห์ความคล้ายได้ดีขึ้น" /> : null}
      {!loading && !error && data && data.length > 0 ? <div className="grid gap-3">{data.map((item) => <SimilarProductCard key={item.relatedProductId} recommendation={item} />)}</div> : null}
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </section>
  );
}
