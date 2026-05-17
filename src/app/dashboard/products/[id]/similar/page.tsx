import { SimilarProductCard } from "@/components/products/SimilarProductCard";

interface SimilarPageProps {
  params: Promise<{ id: string }>;
}

async function getSimilarProducts(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/products/${id}/similar`, {
    cache: "no-store"
  });

  if (!res.ok) return [];
  const body = await res.json();
  return body.data ?? [];
}

export default async function SimilarProductsPage({ params }: SimilarPageProps) {
  const { id } = await params;
  const recommendations = await getSimilarProducts(id);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">สินค้าที่คล้ายกัน</h1>
        <form action={`/api/products/${id}/similar-refresh`} method="post">
          <button className="rounded bg-black px-3 py-2 text-sm font-medium text-white" type="submit">
            Refresh Recommendation
          </button>
        </form>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
          ยังมีข้อมูลสินค้าไม่พอสำหรับแนะนำสินค้าใกล้เคียง
        </div>
      ) : (
        <div className="grid gap-3">
          {recommendations.map((item: { relatedProductId: string; score: number; reasons: string[] }) => (
            <SimilarProductCard key={item.relatedProductId} recommendation={item} />
          ))}
        </div>
      )}
    </main>
  );
}
