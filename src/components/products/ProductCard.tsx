import Link from "next/link";
import Image from "next/image";
import type { ProductRecord } from "@/services/ProductService";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

type ProductCardProps = { product: ProductRecord };

export function ProductCard({ product }: ProductCardProps) {
  const hasAffiliate = Boolean(product.affiliateUrl);
  const hasImage = Boolean(product.images?.[0]?.url);

  return (
    <article className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Header Strip */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {product.title || "สินค้าไม่มีชื่อ"}
          </h3>
          <StatusBadge
            label={hasAffiliate ? "มีลิงก์ Affiliate" : "ยังไม่มีลิงก์"}
            tone={hasAffiliate ? "success" : "warning"}
          />
        </div>

        {/* Product Image */}
        {hasImage ? (
          <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
            <Image
              src={product.images?.[0]?.url ?? ""}
              alt={product.title || "รูปสินค้า"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          </div>
        ) : (
          <div className="mb-3 flex h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400">
            <span className="text-2xl mb-1">🛍️</span>
            <span className="text-xs">ยังไม่มีรูปสินค้า</span>
          </div>
        )}

        {/* Price & Meta */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-extrabold text-sky-600 dark:text-sky-400">
            ฿{Number(product.price || 0).toLocaleString("th-TH")}
          </p>
          {product.shopName ? (
            <span className="text-xs text-slate-400 truncate max-w-[120px]">
              🏬 {product.shopName}
            </span>
          ) : null}
        </div>

        <p className="truncate text-[11px] text-slate-400 font-mono mb-4">
          {product.originalUrl || "ไม่มี URL ต้นทาง"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Link href={`/dashboard/generator?productId=${product.id}`} className="block">
          <Button size="sm" variant="primary" className="w-full text-xs font-semibold">
            ✍️ เขียนรีวิว AI
          </Button>
        </Link>
        <Link href={`/dashboard/products/${product.id}`} className="block">
          <Button size="sm" variant="secondary" className="w-full text-xs">
            ดูรายละเอียด
          </Button>
        </Link>
      </div>
    </article>
  );
}
