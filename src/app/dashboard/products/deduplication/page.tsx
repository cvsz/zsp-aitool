export const dynamic = "force-dynamic";
import { getAuthenticatedUserIdForServer } from "@/lib/auth";
import { productDeduplicationService } from "@/services/ProductDeduplicationService";
import { ProductDeduplicationPanel } from "@/components/products/ProductDeduplicationPanel";

export default async function ProductDeduplicationPage() {
  const userId = await getAuthenticatedUserIdForServer();
  const groups = await productDeduplicationService.listGroups(userId);
  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">จัดการสินค้าซ้ำ</h1><ProductDeduplicationPanel initialGroups={groups as never[]} /></main>;
}
