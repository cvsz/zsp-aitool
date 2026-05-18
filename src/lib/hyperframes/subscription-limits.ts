import { RenderJobStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const hyperFramesPlanKeys = ["free", "pro", "team", "enterprise"] as const;
export type HyperFramesPlanKey = (typeof hyperFramesPlanKeys)[number];

import { PlanTier, RenderJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type HyperFramesPlanLimits = {
  monthlyRenders: number;
  maxDurationSeconds: number;
  maxConcurrentJobs: number;
  maxOutputSizeMb: number;
};

export const HYPERFRAMES_PLAN_LIMITS: Record<HyperFramesPlanKey, HyperFramesPlanLimits> = {
  free: { monthlyRenders: 20, maxDurationSeconds: 15, maxConcurrentJobs: 1, maxOutputSizeMb: 100 },
  pro: { monthlyRenders: 200, maxDurationSeconds: 60, maxConcurrentJobs: 3, maxOutputSizeMb: 512 },
  team: { monthlyRenders: 1000, maxDurationSeconds: 120, maxConcurrentJobs: 8, maxOutputSizeMb: 1024 },
  enterprise: { monthlyRenders: 10000, maxDurationSeconds: 300, maxConcurrentJobs: 25, maxOutputSizeMb: 4096 }
};

export async function getUserHyperFramesPlan(userId: string): Promise<HyperFramesPlanKey> {
  const setting = await prisma.userSetting.findUnique({ where: { userId }, select: { subscriptionPlan: true } });
  const value = setting?.subscriptionPlan?.toLowerCase();
  return hyperFramesPlanKeys.includes(value as HyperFramesPlanKey) ? (value as HyperFramesPlanKey) : "free";
}

export async function getUserPlanUsage(userId: string, plan: HyperFramesPlanKey) {
  const limits = HYPERFRAMES_PLAN_LIMITS[plan];
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const [monthCount, runningCount] = await Promise.all([
    prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null, createdAt: { gte: start } } }),
    prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null, status: { in: [RenderJobStatus.PENDING, RenderJobStatus.RUNNING] } } })
  ]);

  return {
    limits,
    monthCount,
    runningCount,
    monthlyRemaining: Math.max(0, limits.monthlyRenders - monthCount)
  };
export const HYPERFRAMES_PLAN_LIMITS: Record<PlanTier, HyperFramesPlanLimits> = {
  FREE: { monthlyRenders: 10, maxDurationSeconds: 20, maxConcurrentJobs: 1, maxOutputSizeMb: 80 },
  PRO: { monthlyRenders: 120, maxDurationSeconds: 60, maxConcurrentJobs: 3, maxOutputSizeMb: 256 },
  TEAM: { monthlyRenders: 600, maxDurationSeconds: 120, maxConcurrentJobs: 10, maxOutputSizeMb: 512 },
  ENTERPRISE: { monthlyRenders: 5000, maxDurationSeconds: 300, maxConcurrentJobs: 25, maxOutputSizeMb: 2048 }
};

export type LimitCheckResult =
  | { allowed: true; plan: PlanTier; limits: HyperFramesPlanLimits; usage: { monthlyRendersUsed: number; runningJobs: number } }
  | { allowed: false; status: 402 | 429; code: "MONTHLY_QUOTA_EXCEEDED" | "DURATION_LIMIT_EXCEEDED" | "CONCURRENT_LIMIT_EXCEEDED"; message: string; plan: PlanTier; limits: HyperFramesPlanLimits; usage: { monthlyRendersUsed: number; runningJobs: number } };

export async function resolveUserPlan(userId: string): Promise<PlanTier> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { planTier: true } });
  return user?.planTier ?? PlanTier.FREE;
}

function getMonthStart(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
}

export async function enforceRenderLimits(params: { userId: string; durationSeconds: number }): Promise<LimitCheckResult> {
  const plan = await resolveUserPlan(params.userId);
  const limits = HYPERFRAMES_PLAN_LIMITS[plan];
  const [monthlyRendersUsed, runningJobs] = await Promise.all([
    prisma.hyperFrameRenderJob.count({
      where: { userId: params.userId, deletedAt: null, createdAt: { gte: getMonthStart() } }
    }),
    prisma.hyperFrameRenderJob.count({ where: { userId: params.userId, deletedAt: null, status: { in: [RenderJobStatus.PENDING, RenderJobStatus.RUNNING] } } })
  ]);

  const usage = { monthlyRendersUsed, runningJobs };
  if (params.durationSeconds > limits.maxDurationSeconds) {
    return { allowed: false, status: 402, code: "DURATION_LIMIT_EXCEEDED", message: `Plan ${plan.toLowerCase()} allows max ${limits.maxDurationSeconds}s render duration`, plan, limits, usage };
  }
  if (monthlyRendersUsed >= limits.monthlyRenders) {
    return { allowed: false, status: 402, code: "MONTHLY_QUOTA_EXCEEDED", message: `Monthly render quota reached for plan ${plan.toLowerCase()}`, plan, limits, usage };
  }
  if (runningJobs >= limits.maxConcurrentJobs) {
    return { allowed: false, status: 429, code: "CONCURRENT_LIMIT_EXCEEDED", message: `Concurrent render limit reached for plan ${plan.toLowerCase()}`, plan, limits, usage };
  }

  return { allowed: true, plan, limits, usage };
}
