import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthenticatedUserIdForServer } from "@/lib/auth";
import { productService } from "@/services/ProductService";

export default async function ProductDetailPage(context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthenticatedUserIdForServer();
    const product = await productService.getById(userId, (await context.params).id);
    return <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">รายละเอียดสินค้า</h1>
      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">{product.title}</h2>
        <p className="text-sm text-slate-600">ราคา {String(product.price)} {product.currency}</p>
        <p className="mt-2 text-sm">{product.description || "ไม่มีคำอธิบาย"}</p>
      </section>
      <section className="rounded-xl border p-4">
        <h3 className="font-semibold">ลิงก์แอฟฟิลิเอต</h3>
        <a className="text-sm text-blue-600" href={product.affiliateUrl || product.originalUrl}>{product.affiliateUrl || product.originalUrl}</a>
      </section>
      <section className="flex flex-wrap gap-2">
        <Link href={`/dashboard/generator?productId=${product.id}`} className="rounded border px-3 py-2 text-sm">สร้างคอนเทนต์ด้วย AI</Link>
        <Link href={`/dashboard/products/${product.id}/similar`} className="rounded border px-3 py-2 text-sm">ดูสินค้าที่คล้ายกัน</Link>
        <Link href="/dashboard/content-history" className="rounded border px-3 py-2 text-sm">ประวัติคอนเทนต์/Export</Link>
      </section>
    </main>;
  } catch {
    notFound();
  }
}
