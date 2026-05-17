import { notFound } from "next/navigation";
import { productService } from "@/services/ProductService";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  try {
    const product = productService.getById(params.id);
    return <main className="p-6 space-y-2"><h1 className="text-xl font-bold">{product.title}</h1><p>{product.price} {product.currency}</p><a className="text-blue-600" href={product.originalUrl}>{product.originalUrl}</a><p>{product.description}</p></main>;
  } catch {
    notFound();
  }
}
