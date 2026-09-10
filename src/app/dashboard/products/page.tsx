export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getAuthenticatedUserIdForServer } from "@/lib/auth";
import { productService } from "@/services/ProductService";
import { ProductGrid } from "@/components/products/ProductGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

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
    <div className="space-y-6">
      <PageHeader
        title="คลังสินค้า (Product Catalog)"
        subtitle={`จัดการสินค้า ลิงก์ Affiliate และข้อมูลสำหรับสร้างคอนเทนต์ (ทั้งหมด ${data.pagination.total.toLocaleString("th-TH")} รายการ)`}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/products/new">
              <Button variant="primary" size="md">
                ➕ เพิ่มสินค้าใหม่
              </Button>
            </Link>
            <Link href="/dashboard/similar">
              <Button variant="secondary" size="md">
                🏷️ สินค้าที่คล้ายกัน
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Card */}
      <Card>
        <CardContent className="p-4">
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 items-center">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="🔍 ค้นหาชื่อสินค้า..."
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              name="category"
              defaultValue={category ?? ""}
              placeholder="📂 หมวดหมู่"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              name="shopName"
              defaultValue={shopName ?? ""}
              placeholder="🏬 ชื่อร้านค้า"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <select
              name="sortBy"
              defaultValue={sortBy ?? "createdAt"}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="createdAt">เรียงตาม: ล่าสุด</option>
              <option value="title">เรียงตาม: ชื่อสินค้า</option>
              <option value="price">เรียงตาม: ราคา</option>
            </select>
            <select
              name="sortDir"
              defaultValue={sortDir ?? "desc"}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="desc">มากไปน้อย</option>
              <option value="asc">น้อยไปมาก</option>
            </select>
            <Button type="submit" variant="primary" size="md">
              ค้นหา
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <ProductGrid products={data.items} />

      {/* Pagination Strip */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          หน้า {data.pagination.page} จาก {data.pagination.totalPages || 1}
        </span>
        <div className="flex gap-2">
          {data.pagination.hasPrevPage ? (
            <Link
              href={`?${new URLSearchParams({
                page: String(data.pagination.page - 1),
                pageSize: String(data.pagination.pageSize),
                q: q ?? "",
                category: category ?? "",
                shopName: shopName ?? "",
                sortBy: sortBy ?? "createdAt",
                sortDir: sortDir ?? "desc",
              })}`}
            >
              <Button size="sm" variant="secondary">ก่อนหน้า</Button>
            </Link>
          ) : (
            <Button size="sm" variant="secondary" disabled>ก่อนหน้า</Button>
          )}
          {data.pagination.hasNextPage ? (
            <Link
              href={`?${new URLSearchParams({
                page: String(data.pagination.page + 1),
                pageSize: String(data.pagination.pageSize),
                q: q ?? "",
                category: category ?? "",
                shopName: shopName ?? "",
                sortBy: sortBy ?? "createdAt",
                sortDir: sortDir ?? "desc",
              })}`}
            >
              <Button size="sm" variant="secondary">ถัดไป</Button>
            </Link>
          ) : (
            <Button size="sm" variant="secondary" disabled>ถัดไป</Button>
          )}
        </div>
      </div>
    </div>
  );
}
