import { JobStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

export class BudgetService {
  /**
   * Calculates the total USD cost consumed by a user today (UTC 00:00:00 to now).
   */
  static async getDailyUsage(userId: string): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const result = await prisma.aPIUsageLog.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startOfToday,
        },
        deletedAt: null,
      },
      _sum: {
        costUsd: true,
      },
    });

    return Number(result._sum.costUsd || 0);
  }

  /**
   * Validates if the user's daily spending has met or exceeded the daily limit.
   * Throws an AppError with HTTP 429 if the budget is breached.
   */
  static async checkBudget(userId: string): Promise<void> {
    const limit = env.AI_DAILY_BUDGET_USD;
    const dailyCost = await this.getDailyUsage(userId);
    if (dailyCost >= limit) {
      throw new AppError(
        "BUDGET_EXCEEDED",
        `Daily AI/OCR budget limit of $${limit} exceeded (spent $${dailyCost.toFixed(4)})`,
        429
      );
    }
  }

  /**
   * Appends a new API usage record into the persistent database.
   */
  static async logUsage(
    userId: string,
    provider: string,
    endpoint: string,
    costUsd: number,
    status: JobStatus = JobStatus.COMPLETED,
    metadata?: Record<string, any>
  ) {
    return prisma.aPIUsageLog.create({
      data: {
        userId,
        provider,
        endpoint,
        costUsd,
        status,
        metadata: metadata || undefined,
      },
    });
  }
}
