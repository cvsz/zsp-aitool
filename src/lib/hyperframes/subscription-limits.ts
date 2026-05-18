import { RenderJobStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const hyperFramesPlanKeys = ["free", "pro", "team", "enterprise"] as const;
export type HyperFramesPlanKey = (typeof hyperFramesPlanKeys)[number];

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
}
