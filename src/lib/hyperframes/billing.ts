import type { NextRequest } from "next/server";

export type HyperFramesFeature = "high_quality" | "batch_render" | "long_duration" | "watermark_removal";

type BillingGateDecision =
  | { allowed: true }
  | { allowed: false; reason: "UPGRADE_REQUIRED" | "QUOTA_EXCEEDED"; message: string; missingFeatures: HyperFramesFeature[] };

type Plan = "free" | "pro" | "business";

const paidPlans = new Set<Plan>(["pro", "business"]);

const featureByPlan: Record<Plan, HyperFramesFeature[]> = {
  free: [],
  pro: ["high_quality", "batch_render", "long_duration", "watermark_removal"],
  business: ["high_quality", "batch_render", "long_duration", "watermark_removal"],
};

function parsePlan(raw: string | null | undefined): Plan {
  if (raw === "pro" || raw === "business" || raw === "free") return raw;
  return "free";
}

function parseQuotaRemaining(raw: string | null | undefined): number {
  if (!raw) return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

export function getHyperFramesBillingState(request: NextRequest) {
  const plan = parsePlan(request.headers.get("x-plan") ?? process.env.HYPERFRAMES_BILLING_DEFAULT_PLAN ?? "free");
  const quotaRemaining = parseQuotaRemaining(request.headers.get("x-hf-quota-remaining") ?? process.env.HYPERFRAMES_BILLING_DEFAULT_QUOTA_REMAINING ?? "0");
  return { plan, quotaRemaining };
}

export function enforceHyperFramesBilling(
  request: NextRequest,
  requiredFeatures: HyperFramesFeature[],
): BillingGateDecision {
  const billing = getHyperFramesBillingState(request);
  if (!paidPlans.has(billing.plan)) {
    return { allowed: false, reason: "UPGRADE_REQUIRED", message: "Upgrade required for paid HyperFrames render features", missingFeatures: requiredFeatures };
  }

  const missingFeatures = requiredFeatures.filter((feature) => !featureByPlan[billing.plan].includes(feature));
  if (missingFeatures.length > 0) {
    return { allowed: false, reason: "UPGRADE_REQUIRED", message: "Current plan does not include requested HyperFrames features", missingFeatures };
  }

  if (billing.quotaRemaining < 1) {
    return { allowed: false, reason: "QUOTA_EXCEEDED", message: "HyperFrames quota exceeded for current billing period", missingFeatures: [] };
  }

  return { allowed: true };
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
