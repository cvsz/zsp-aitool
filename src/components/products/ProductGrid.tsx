import type { ProductRecord } from "@/services/ProductService";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: ProductRecord[] }) {
  if (!products.length) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900">ยังไม่มีสินค้าในคลัง</h2>
        <p className="mt-2 text-sm text-slate-600">เพิ่มสินค้าด้วยการกรอกเอง, URL, OCR หรือไฟล์ JSON เพื่อเริ่มสร้างคอนเทนต์ได้ทันที</p>
      </div>
    );
  }

  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}
