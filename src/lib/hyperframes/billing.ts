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
}
