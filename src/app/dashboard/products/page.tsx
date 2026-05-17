export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getAuthenticatedUserIdForServer } from "@/lib/auth";
import { productService } from "@/services/ProductService";
import { ProductGrid } from "@/components/products/ProductGrid";

export default async function ProductsPage() {
  const userId = await getAuthenticatedUserIdForServer();
  const products = await productService.list(userId);
  return (
    <main className="p-6 space-y-4">
      <div className="flex gap-3">
        <Link className="border px-3 py-2" href="/dashboard/products/new">New Product</Link>
      </div>
      <ProductGrid products={products} />
    </main>
  );
}
