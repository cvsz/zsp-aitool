import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateIngestionService, type ShopeeAffiliateQueueStatus } from "@/services/ShopeeAffiliateIngestionService";

const allowedStatuses = new Set<ShopeeAffiliateQueueStatus>(["pending_review", "approved", "rejected", "imported", "failed"]);

export const GET = withAuth(async (request) => {
  const url = new URL(request.url);
  const rawStatus = url.searchParams.get("status") as ShopeeAffiliateQueueStatus | null;
  const status = rawStatus && allowedStatuses.has(rawStatus) ? rawStatus : undefined;
  const [items, summary] = await Promise.all([
    shopeeAffiliateIngestionService.list(request.auth.userId, status),
    shopeeAffiliateIngestionService.getSummary(request.auth.userId),
  ]);
  return NextResponse.json({ ok: true, data: { items, summary } });
});
