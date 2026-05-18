import { prisma } from "@/lib/prisma";

export type HyperFramesBillingFeatureFlags = {
  quality: "standard" | "high";
  batchSize: number;
  durationSeconds: number;
  removeWatermark: boolean;
};

const FREE_PLAN_MAX_DURATION_SECONDS = 15;
const FREE_PLAN_MAX_RENDERS_PER_MONTH = 10;

export async function getHyperFramesBillingState(userId: string) {
  const plan = (process.env.HYPERFRAMES_BILLING_PLAN ?? "free").toLowerCase();
  const monthlyQuota = Number(process.env.HYPERFRAMES_MONTHLY_QUOTA ?? FREE_PLAN_MAX_RENDERS_PER_MONTH);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const monthlyUsage = await prisma.hyperFrameRenderJob.count({
    where: { userId, createdAt: { gte: monthStart }, deletedAt: null },
  });

  return {
    plan,
    monthlyQuota,
    monthlyUsage,
    hasQuota: monthlyUsage < monthlyQuota,
  };
}

export function evaluateHyperFramesBillingAccess(
  state: Awaited<ReturnType<typeof getHyperFramesBillingState>>,
  features: HyperFramesBillingFeatureFlags,
) {
  if (!state.hasQuota) return { allowed: false, reason: "quota_exceeded" as const };
  if (state.plan === "pro") return { allowed: true as const };

  if (features.quality === "high") return { allowed: false, reason: "high_quality_requires_upgrade" as const };
  if (features.batchSize > 1) return { allowed: false, reason: "batch_render_requires_upgrade" as const };
  if (features.durationSeconds > FREE_PLAN_MAX_DURATION_SECONDS) return { allowed: false, reason: "long_duration_requires_upgrade" as const };
  if (features.removeWatermark) return { allowed: false, reason: "watermark_removal_requires_upgrade" as const };

  return { allowed: true as const };
}
