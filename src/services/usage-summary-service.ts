import { PlanTier } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getUserHyperFramesPlan, getUserPlanUsage } from "@/lib/hyperframes/subscription-limits";
import { HyperFramesQuotaService } from "@/services/HyperFramesQuotaService";
import { BudgetService } from "@/services/BudgetService";
import { env } from "@/lib/env";

export type UsageSummary = {
  plan: PlanTier;
  usage: {
    products: number;
    aiGenerations: number;
    exports: number;
    ocrJobs: number;
    hyperframesRenders: number;
    hyperframesStorageMb: number;
    dailySpendUsd: number;
  };
  limits: {
    aiPerMinute: number;
    ocrPerMinute: number;
    hyperframesMonthlyRenders: number;
    hyperframesMonthlyRemaining: number;
    hyperframesStorageMb: number;
    dailyBudgetUsd: number;
  };
  workspace: {
    memberships: number;
    rbacEnabled: boolean;
    note: string;
  };
  dailyAiOcrSpend: number;
  dailyLimitUsd: number;
};

export async function getUserUsageSummary(userId: string): Promise<UsageSummary> {
  const [user, products, aiGenerations, exportsCount, ocrJobs, renderJobs, quota, orgMemberships, dailyAiOcrSpend] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { planTier: true } }),
    prisma.product.count({ where: { userId, deletedAt: null } }),
    prisma.contentGeneration.count({ where: { userId, deletedAt: null } }),
    prisma.aPIUsageLog.count({ where: { userId, deletedAt: null, endpoint: { startsWith: "export:" } } }),
    prisma.oCRJob.count({ where: { userId } }),
    prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null } }),
    HyperFramesQuotaService.getUserQuotaSummary(userId),
    prisma.orgMembership.count({ where: { userId } }),
    BudgetService.getDailyUsage(userId),
  ]);

  const dailyUsage = dailyAiOcrSpend;

  const plan = user?.planTier ?? PlanTier.FREE;
  const hfPlan = await getUserHyperFramesPlan(userId);
  const hfUsage = await getUserPlanUsage(userId, hfPlan);

  return {
    plan,
    usage: {
      products,
      aiGenerations,
      exports: exportsCount,
      ocrJobs,
      hyperframesRenders: renderJobs,
      hyperframesStorageMb: quota.storageUsedMb,
      dailySpendUsd: dailyUsage,
    },
    limits: {
      aiPerMinute: Number(process.env.AI_MAX_REQUESTS_PER_MINUTE ?? 30),
      ocrPerMinute: Number(process.env.OCR_MAX_REQUESTS_PER_MINUTE ?? 20),
      hyperframesMonthlyRenders: hfUsage.limits.monthlyRenders,
      hyperframesMonthlyRemaining: hfUsage.monthlyRemaining,
      hyperframesStorageMb: quota.storageQuotaMb,
      dailyBudgetUsd: Number(process.env.AI_DAILY_BUDGET_USD ?? 20),
    },
    workspace: {
      memberships: orgMemberships,
      rbacEnabled: true,
      note: "ระบบ Workspace/Team เปิดใช้ตามสมาชิกองค์กรและสิทธิ์ VIEWER/EDITOR/ADMIN โดยไม่เปิดฟีเจอร์เรียกเก็บเงินจริงในหน้านี้",
    },
    dailyAiOcrSpend,
    dailyLimitUsd: env.AI_DAILY_BUDGET_USD,
  };
}


