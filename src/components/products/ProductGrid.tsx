import type { ProductRecord } from "@/services/ProductService";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: ProductRecord[] }) {
  if (!products.length) return <p>No products found.</p>;
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}
