import { RenderJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_MONTHLY_RENDER_QUOTA = 50;
const DEFAULT_STORAGE_QUOTA_MB = 1024;
const DEFAULT_RETENTION_DAYS = 14;
const DEFAULT_ACTIVE_RENDER_LIMIT = 3;

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export type HyperFramesQuotaSummary = {
  monthlyRenderQuota: number;
  monthlyRenderCount: number;
  remainingMonthlyRenders: number;
  activeJobLimit: number;
  activeJobCount: number;
  storageUsedMb: number;
  storageQuotaMb: number;
  retentionDays: number;
};

export class HyperFramesQuotaService {
  static getDefaultQuotaConfig() {
    return {
      monthlyRenderQuota: toInt(process.env.HYPERFRAMES_DEFAULT_MONTHLY_RENDER_QUOTA, DEFAULT_MONTHLY_RENDER_QUOTA),
      storageQuotaMb: toInt(process.env.HYPERFRAMES_DEFAULT_STORAGE_QUOTA_MB, DEFAULT_STORAGE_QUOTA_MB),
      retentionDays: toInt(process.env.HYPERFRAMES_DEFAULT_RETENTION_DAYS, DEFAULT_RETENTION_DAYS),
      activeJobLimit: toInt(process.env.HYPERFRAMES_DEFAULT_ACTIVE_RENDER_LIMIT, DEFAULT_ACTIVE_RENDER_LIMIT),
    };
  }

  static async getUserQuotaSummary(userId: string, now: Date = new Date()): Promise<HyperFramesQuotaSummary> {
    const defaults = this.getDefaultQuotaConfig();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const [monthlyRenderCount, activeJobCount, storageAgg] = await Promise.all([
      prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null, createdAt: { gte: monthStart } } }),
      prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null, status: { in: [RenderJobStatus.PENDING, RenderJobStatus.RUNNING] } } }),
      prisma.hyperFrameRenderJob.aggregate({ where: { userId, deletedAt: null, status: RenderJobStatus.COMPLETED }, _sum: { outputSizeBytes: true } }),
    ]);

    const usedBytesRaw = storageAgg._sum.outputSizeBytes ?? 0;
    const usedBytes = typeof usedBytesRaw === "bigint" ? Number(usedBytesRaw) : usedBytesRaw;
    const storageUsedMb = Math.max(0, Math.ceil(usedBytes / (1024 * 1024)));
    return {
      monthlyRenderQuota: defaults.monthlyRenderQuota,
      monthlyRenderCount,
      remainingMonthlyRenders: Math.max(0, defaults.monthlyRenderQuota - monthlyRenderCount),
      activeJobLimit: defaults.activeJobLimit,
      activeJobCount,
      storageUsedMb,
      storageQuotaMb: defaults.storageQuotaMb,
      retentionDays: defaults.retentionDays,
    };
  }

  static async enforceBeforeEnqueue(userId: string): Promise<{ allowed: true; summary: HyperFramesQuotaSummary } | { allowed: false; code: string; message: string; summary: HyperFramesQuotaSummary }> {
    const summary = await this.getUserQuotaSummary(userId);
    if (summary.monthlyRenderCount >= summary.monthlyRenderQuota) {
      return { allowed: false, code: "MONTHLY_QUOTA_EXCEEDED", message: "Monthly render quota exceeded", summary };
    }
    if (summary.activeJobCount >= summary.activeJobLimit) {
      return { allowed: false, code: "ACTIVE_QUOTA_EXCEEDED", message: "Active render limit reached", summary };
    }
    if (summary.storageUsedMb >= summary.storageQuotaMb) {
      return { allowed: false, code: "STORAGE_QUOTA_EXCEEDED", message: "Storage quota exceeded", summary };
    }
    return { allowed: true, summary };
  }
}
