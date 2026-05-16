import Link from "next/link";
import type { ProductRecord } from "@/services/ProductService";

export function ProductCard({ product }: { product: ProductRecord }) {
  return (
    <article className="rounded border p-4">
      <h3 className="font-semibold">{product.title}</h3>
      <p className="text-sm">{product.price} {product.currency}</p>
      <p className="text-xs truncate">{product.originalUrl}</p>
      <Link className="text-blue-600 text-sm" href={`/dashboard/products/${product.id}`}>View detail</Link>
    </article>
  );
}
