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
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">คลังสินค้า</h1>
          <p className="text-sm text-slate-600">จัดการสินค้า ลิงก์แอฟฟิลิเอต และเริ่มสร้างคอนเทนต์ได้จากที่เดียว</p>
        </div>
        <Link className="rounded-lg border px-3 py-2 text-sm" href="/dashboard/products/new">เพิ่มสินค้าใหม่</Link>
      </header>
      <ProductGrid products={products} />
    </main>
  );
}
