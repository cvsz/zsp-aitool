"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { SimilarProductCard } from "@/components/products/SimilarProductCard";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";

type SimilarItem = { relatedProductId: string; score: number; reasons: string[] };

export default function SimilarProductsPage() {
  const { data, loading, error, refetch } = useApi<SimilarItem[]>("/api/products/similar");
  const { toast, showToast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="สินค้าที่คล้ายกัน (Similar Products)"
        subtitle="ตรวจจับความซ้ำซ้อนและจัดกลุ่มสินค้าที่มีสเปกใกล้เคียงกันเพื่อวางแผนคอนเทนต์ Cross-Selling"
        actions={
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              void refetch();
              showToast("รีเฟรชข้อมูลสินค้าที่คล้ายกันเรียบร้อยแล้ว", "success");
            }}
          >
            🔄 รีเฟรชข้อมูล
          </Button>
        }
      />

      {loading ? <LoadingSpinner label="กำลังวิเคราะห์ความคล้ายของสินค้า..." /> : null}
      {error ? (
        <AlertBanner
          title="เกิดข้อผิดพลาดในการดึงข้อมูล"
          description={error}
          variant="error"
        />
      ) : null}

      {!loading && !error && (!data || data.length === 0) ? (
        <EmptyState
          title="ข้อมูลยังไม่เพียงพอสำหรับการจับคู่"
          description="เพิ่มรายละเอียดสเปกสินค้าและภาพถ่ายให้ครบถ้วน เพื่อให้ระบบวิเคราะห์ความคล้ายได้แม่นยำยิ่งขึ้น"
          tone="muted"
        />
      ) : null}

      {!loading && !error && data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <SimilarProductCard key={item.relatedProductId} recommendation={item} />
          ))}
        </div>
      ) : null}

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </div>
  );
}
