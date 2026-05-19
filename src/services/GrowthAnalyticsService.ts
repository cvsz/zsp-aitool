import { RenderJobStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type ActivityRow = { usersRegistered: number; productsCreated: number; aiGenerations: number; feedbackSubmissions: number };

export type GrowthAnalyticsSummary = {
  metrics: {
    registeredUsersCount: number;
    productsCreatedCount: number;
    firstProductSavedConversionPercent: number;
    aiGenerationsCount: number;
    firstAiGenerationConversionPercent: number;
    exportsActionsCount: number;
    hyperframesRenderAttemptsCount: number;
    hyperframesRenderCompletionsCount: number;
    feedbackSubmissionsCount: number;
  };
  activationFunnel: Array<{ step: string; users: number; conversionPercent: number }>;
  recentAggregateActivity: Array<{ date: string; usersRegistered: number; productsCreated: number; aiGenerations: number; feedbackSubmissions: number }>;
};

function pct(part: number, total: number) { return total <= 0 ? 0 : Math.round((part / total) * 10000) / 100; }

export class GrowthAnalyticsService {
  async getAdminSummary(days = 7): Promise<GrowthAnalyticsSummary> {
    const since = new Date(Date.now() - days * 86400000);
    const [users, usersWithProduct, usersWithAi, products, aiGenerations, exportsActionsCount, renderAttempts, renderCompletions, feedbackCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { products: { some: { deletedAt: null } } } }),
      prisma.user.count({ where: { contentGenerations: { some: { deletedAt: null } } } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.contentGeneration.count({ where: { deletedAt: null } }),
      prisma.aPIUsageLog.count({ where: { deletedAt: null, endpoint: { startsWith: "export:" } } }),
      prisma.hyperFrameRenderJob.count({ where: { deletedAt: null } }),
      prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: RenderJobStatus.COMPLETED } }),
      prisma.feedbackSubmission.count({ where: { deletedAt: null } }),
    ]);

    const byDate = new Map<string, ActivityRow>();
    const bump = (date: string, key: keyof ActivityRow, value: number) => {
      const curr = byDate.get(date) ?? { usersRegistered: 0, productsCreated: 0, aiGenerations: 0, feedbackSubmissions: 0 };
      curr[key] += value;
      byDate.set(date, curr);
    };

    const [userDaily, productDaily, aiDaily, feedbackDaily] = await Promise.all([
      prisma.user.groupBy({ by: ["createdAt"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
      prisma.product.groupBy({ by: ["createdAt"], where: { createdAt: { gte: since }, deletedAt: null }, _count: { _all: true } }),
      prisma.contentGeneration.groupBy({ by: ["createdAt"], where: { createdAt: { gte: since }, deletedAt: null }, _count: { _all: true } }),
      prisma.feedbackSubmission.groupBy({ by: ["createdAt"], where: { createdAt: { gte: since }, deletedAt: null }, _count: { _all: true } }),
    ]);

    for (const row of userDaily) bump(row.createdAt.toISOString().slice(0, 10), "usersRegistered", row._count._all);
    for (const row of productDaily) bump(row.createdAt.toISOString().slice(0, 10), "productsCreated", row._count._all);
    for (const row of aiDaily) bump(row.createdAt.toISOString().slice(0, 10), "aiGenerations", row._count._all);
    for (const row of feedbackDaily) bump(row.createdAt.toISOString().slice(0, 10), "feedbackSubmissions", row._count._all);

    return {
      metrics: {
        registeredUsersCount: users,
        productsCreatedCount: products,
        firstProductSavedConversionPercent: pct(usersWithProduct, users),
        aiGenerationsCount: aiGenerations,
        firstAiGenerationConversionPercent: pct(usersWithAi, users),
        exportsActionsCount,
        hyperframesRenderAttemptsCount: renderAttempts,
        hyperframesRenderCompletionsCount: renderCompletions,
        feedbackSubmissionsCount: feedbackCount,
      },
      activationFunnel: [
        { step: "registered_users", users, conversionPercent: 100 },
        { step: "first_product_saved", users: usersWithProduct, conversionPercent: pct(usersWithProduct, users) },
        { step: "first_ai_generation", users: usersWithAi, conversionPercent: pct(usersWithAi, users) },
      ],
      recentAggregateActivity: [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, counts]) => ({ date, ...counts })),
    };
  }
}

export const growthAnalyticsService = new GrowthAnalyticsService();
