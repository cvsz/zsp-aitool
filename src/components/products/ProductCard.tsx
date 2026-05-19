import Link from "next/link";
import Image from "next/image";
import type { ProductRecord } from "@/services/ProductService";

type ProductCardProps = { product: ProductRecord };

function affiliateStatus(product: ProductRecord): { label: string; tone: string } {
  if (product.affiliateUrl) {
    return { label: "มีลิงก์แอฟฟิลิเอต", tone: "bg-emerald-100 text-emerald-700" };
  }
  return { label: "ยังไม่มีลิงก์แอฟฟิลิเอต", tone: "bg-amber-100 text-amber-700" };
}

export function ProductCard({ product }: ProductCardProps) {
  const status = affiliateStatus(product);
  const hasImage = Boolean(product.images?.[0]?.url);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="line-clamp-2 font-semibold text-slate-900">{product.title || "สินค้าไม่มีชื่อ"}</h3>
          <p className="mt-1 text-sm text-slate-600">{String(product.price)} {product.currency}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
      </div>

      {hasImage ? (
        <Image
          src={product.images?.[0]?.url ?? ""}
          alt={product.title || "รูปสินค้า"}
          width={640}
          height={360}
          className="mb-3 h-36 w-full rounded-lg border object-cover"
          unoptimized
        />
      ) : (
        <div className="mb-3 flex h-36 w-full items-center justify-center rounded-lg border border-dashed text-sm text-slate-500">
          ยังไม่มีรูปสินค้า
        </div>
      )}

      <p className="truncate text-xs text-slate-500">{product.originalUrl || "ไม่มี URL ต้นทาง"}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Link className="rounded-lg border px-3 py-2 text-center" href={`/dashboard/products/${product.id}`}>ดูรายละเอียด</Link>
        <Link className="rounded-lg border px-3 py-2 text-center" href={`/dashboard/products/${product.id}/similar`}>สินค้าคล้ายกัน</Link>
        <Link className="rounded-lg border px-3 py-2 text-center" href={`/dashboard/generator?productId=${product.id}`}>สร้างคอนเทนต์</Link>
        <Link className="rounded-lg border px-3 py-2 text-center" href={`/dashboard/products/${product.id}`}>แก้ไขข้อมูล</Link>
      </div>
    </article>
  );
}
