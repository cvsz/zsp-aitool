import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

export type HyperFramesFeature = "high_quality" | "batch_render" | "long_duration" | "watermark_removal";
export type BillingPlan = "free" | "pro" | "team" | "enterprise";
export type BillingGateDecision = { allowed: true } | { allowed: false; reason: "UPGRADE_REQUIRED" | "QUOTA_EXCEEDED"; message: string; missingFeatures: HyperFramesFeature[] };
export type HyperFramesBillingFeatureFlags = { quality: "standard" | "high"; batchSize: number; durationSeconds: number; removeWatermark: boolean };

const paidPlans = new Set<BillingPlan>(["pro", "team", "enterprise"]);
const featureByPlan: Record<BillingPlan, HyperFramesFeature[]> = {
  free: [],
  pro: ["high_quality", "long_duration", "watermark_removal"],
  team: ["high_quality", "batch_render", "long_duration", "watermark_removal"],
  enterprise: ["high_quality", "batch_render", "long_duration", "watermark_removal"],
};
const FREE_PLAN_MAX_DURATION_SECONDS = 15;
const FREE_PLAN_MAX_RENDERS_PER_MONTH = 10;

function parsePlan(raw: string | null | undefined): BillingPlan {
  const value = (raw ?? "free").trim().toLowerCase();
  return value === "pro" || value === "team" || value === "enterprise" ? value : "free";
}

function parseQuotaRemaining(raw: string | null | undefined): number {
  const parsed = Number(raw ?? "0");
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

export function getHyperFramesRequestBillingState(request: NextRequest) {
  const plan = parsePlan(request.headers.get("x-plan") ?? process.env.HYPERFRAMES_BILLING_DEFAULT_PLAN ?? "free");
  const quotaRemaining = parseQuotaRemaining(request.headers.get("x-hf-quota-remaining") ?? process.env.HYPERFRAMES_BILLING_DEFAULT_QUOTA_REMAINING ?? "0");
  return { plan, quotaRemaining };
}

export function enforceHyperFramesBilling(request: NextRequest, requiredFeatures: HyperFramesFeature[]): BillingGateDecision {
  const billing = getHyperFramesRequestBillingState(request);
  if (requiredFeatures.length === 0) return { allowed: true };
  if (!paidPlans.has(billing.plan)) return { allowed: false, reason: "UPGRADE_REQUIRED", message: "Upgrade required for paid HyperFrames render features", missingFeatures: requiredFeatures };
  if (billing.quotaRemaining < 1) return { allowed: false, reason: "QUOTA_EXCEEDED", message: "HyperFrames quota exceeded for current billing period", missingFeatures: [] };
  const missingFeatures = requiredFeatures.filter((feature) => !featureByPlan[billing.plan].includes(feature));
  if (missingFeatures.length > 0) return { allowed: false, reason: "UPGRADE_REQUIRED", message: "Current plan does not include requested HyperFrames features", missingFeatures };
  return { allowed: true };
}

export async function getHyperFramesBillingState(userId: string) {
  const plan = parsePlan(process.env.HYPERFRAMES_BILLING_PLAN ?? "free");
  const monthlyQuota = Number(process.env.HYPERFRAMES_MONTHLY_QUOTA ?? FREE_PLAN_MAX_RENDERS_PER_MONTH);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const monthlyUsage = await prisma.hyperFrameRenderJob.count({ where: { userId, createdAt: { gte: monthStart }, deletedAt: null } });
  return { plan, monthlyQuota, monthlyUsage, hasQuota: monthlyUsage < monthlyQuota };
}

export function evaluateHyperFramesBillingAccess(state: Awaited<ReturnType<typeof getHyperFramesBillingState>>, features: HyperFramesBillingFeatureFlags) {
  if (!state.hasQuota) return { allowed: false as const, reason: "quota_exceeded" as const };
  if (state.plan !== "free") return { allowed: true as const };
  if (features.quality === "high") return { allowed: false as const, reason: "high_quality_requires_upgrade" as const };
  if (features.batchSize > 1) return { allowed: false as const, reason: "batch_render_requires_upgrade" as const };
  if (features.durationSeconds > FREE_PLAN_MAX_DURATION_SECONDS) return { allowed: false as const, reason: "long_duration_requires_upgrade" as const };
  if (features.removeWatermark) return { allowed: false as const, reason: "watermark_removal_requires_upgrade" as const };
  return { allowed: true as const };
}
