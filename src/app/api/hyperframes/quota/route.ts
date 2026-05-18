import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { HyperFramesQuotaService } from "@/services/HyperFramesQuotaService";

export const GET = withAuth(async (request) => {
  const quota = await HyperFramesQuotaService.getUserQuotaSummary(request.auth.userId);
  return NextResponse.json({ ok: true, data: { remainingMonthlyRenders: quota.remainingMonthlyRenders, storageUsedMb: quota.storageUsedMb, storageQuotaMb: quota.storageQuotaMb, retentionDays: quota.retentionDays } });
});
