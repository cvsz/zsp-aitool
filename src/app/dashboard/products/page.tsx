import Link from "next/link";
import { productService } from "@/services/ProductService";
import { ProductGrid } from "@/components/products/ProductGrid";

export default function ProductsPage() {
  const products = productService.list();
  return (
    <main className="p-6 space-y-4">
      <div className="flex gap-3">
        <Link className="border px-3 py-2" href="/dashboard/products/new">New Product</Link>
      </div>
      <ProductGrid products={products} />
    </main>
  );
}
