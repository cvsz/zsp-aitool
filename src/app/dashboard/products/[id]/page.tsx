import { notFound } from "next/navigation";
import { getAuthenticatedUserIdForServer } from "@/lib/auth";
import { productService } from "@/services/ProductService";

export default async function ProductDetailPage(context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthenticatedUserIdForServer();
    const product = await productService.getById(userId, (await context.params).id);
    return <main className="p-6 space-y-2"><h1 className="text-xl font-bold">{product.title}</h1><p>{String(product.price)} {product.currency}</p><a className="text-blue-600" href={product.originalUrl}>{product.originalUrl}</a><p>{product.description}</p></main>;
  } catch {
    notFound();
  }
}
