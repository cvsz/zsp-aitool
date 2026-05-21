export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getAuthenticatedUserIdForServer } from "@/lib/auth";
import { productService } from "@/services/ProductService";
import { ProductGrid } from "@/components/products/ProductGrid";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const userId = await getAuthenticatedUserIdForServer();
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const pageSize = Number(Array.isArray(sp.pageSize) ? sp.pageSize[0] : sp.pageSize) || 25;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const category = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const shopName = Array.isArray(sp.shopName) ? sp.shopName[0] : sp.shopName;
  const sortBy = (Array.isArray(sp.sortBy) ? sp.sortBy[0] : sp.sortBy) as "createdAt" | "title" | "price" | undefined;
  const sortDir = (Array.isArray(sp.sortDir) ? sp.sortDir[0] : sp.sortDir) as "asc" | "desc" | undefined;

  const data = await productService.listProductsPaginated(userId, { page, pageSize, q, category, shopName, sortBy, sortDir });

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">คลังสินค้า</h1>
          <p className="text-sm text-slate-600">ทั้งหมด {data.pagination.total.toLocaleString("th-TH")} รายการ</p>
        </div>
        <Link className="rounded-lg border px-3 py-2 text-sm" href="/dashboard/products/new">เพิ่มสินค้าใหม่</Link>
        <Link className="rounded-lg border px-3 py-2 text-sm" href="/dashboard/products/deduplication">จัดการสินค้าซ้ำ</Link>
      </header>
      <form className="grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-6">
        <input name="q" defaultValue={q ?? ""} placeholder="ค้นหา" className="rounded border px-2 py-1" />
        <input name="category" defaultValue={category ?? ""} placeholder="หมวดหมู่" className="rounded border px-2 py-1" />
        <input name="shopName" defaultValue={shopName ?? ""} placeholder="ร้านค้า" className="rounded border px-2 py-1" />
        <select name="sortBy" defaultValue={sortBy ?? "createdAt"} className="rounded border px-2 py-1"><option value="createdAt">ล่าสุด</option><option value="title">ชื่อสินค้า</option><option value="price">ราคา</option></select>
        <select name="sortDir" defaultValue={sortDir ?? "desc"} className="rounded border px-2 py-1"><option value="desc">มากไปน้อย</option><option value="asc">น้อยไปมาก</option></select>
        <select name="pageSize" defaultValue={String(pageSize)} className="rounded border px-2 py-1"><option value="25">25</option><option value="50">50</option><option value="100">100</option></select>
        <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white md:col-span-6">ค้นหา</button>
      </form>
      <ProductGrid products={data.items} />
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">หน้า {data.pagination.page} / {data.pagination.totalPages}</span>
        <div className="flex gap-2">
          {data.pagination.hasPrevPage ? <Link className="rounded border px-3 py-1" href={`?${new URLSearchParams({ page: String(data.pagination.page - 1), pageSize: String(data.pagination.pageSize), q: q ?? "", category: category ?? "", shopName: shopName ?? "", sortBy: sortBy ?? "createdAt", sortDir: sortDir ?? "desc" })}`}>ก่อนหน้า</Link> : <span className="rounded border px-3 py-1 text-slate-400">ก่อนหน้า</span>}
          {data.pagination.hasNextPage ? <Link className="rounded border px-3 py-1" href={`?${new URLSearchParams({ page: String(data.pagination.page + 1), pageSize: String(data.pagination.pageSize), q: q ?? "", category: category ?? "", shopName: shopName ?? "", sortBy: sortBy ?? "createdAt", sortDir: sortDir ?? "desc" })}`}>ถัดไป</Link> : <span className="rounded border px-3 py-1 text-slate-400">ถัดไป</span>}
        </div>
      </div>
    </main>
  );
}
