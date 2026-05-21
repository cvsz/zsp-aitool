import { JobStatus, Language, Platform, Prisma, Tone } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { BudgetService } from "@/services/BudgetService";
import { AIContentService } from "@/services/AIContentService";
import { MockAIProvider } from "@/services/ai/MockAIProvider";

export type QueueStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

const unsafeClaimPattern = /(guaranteed\s+(income|return|result)|no\s+risk|100%\s+guaranteed|miracle\s+cure|fake\s+review|used\s+this\s+myself)/i;

export class AIContentQueueService {
  private readonly aiService = new AIContentService(new MockAIProvider());

  async enqueue(params: { userId: string; productIds: string[]; kind: string; platform?: Platform; tone?: Tone; language?: Language; input?: Prisma.InputJsonValue }) {
    await BudgetService.checkBudget(params.userId);
    const products = await prisma.product.findMany({ where: { userId: params.userId, id: { in: params.productIds }, deletedAt: null }, select: { id: true } });
    if (products.length !== new Set(params.productIds).size) throw new AppError("NOT_FOUND", "One or more products not found", 404);

    const jobs = await prisma.aIContentQueueJob.createManyAndReturn({
      data: products.map((product) => ({ userId: params.userId, productId: product.id, kind: params.kind, platform: params.platform, tone: params.tone, language: params.language ?? Language.TH, input: params.input })),
    });
    return jobs;
  }

  async list(userId: string) {
    return prisma.aIContentQueueJob.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } });
  }

  async getById(userId: string, id: string) {
    const job = await prisma.aIContentQueueJob.findFirst({ where: { id, userId, deletedAt: null } });
    if (!job) throw new AppError("NOT_FOUND", "Queue job not found", 404);
    return job;
  }

  async cancel(userId: string, id: string) {
    await this.getById(userId, id);
    return prisma.aIContentQueueJob.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
  }

  async retry(userId: string, id: string) {
    const job = await this.getById(userId, id);
    if (job.status !== "FAILED" && job.status !== "CANCELLED") throw new AppError("INVALID_STATE", "Only failed or cancelled jobs can be retried", 409);
    return prisma.aIContentQueueJob.update({ where: { id }, data: { status: "PENDING", failedAt: null, cancelledAt: null, errorSummary: null } });
  }

  async claimPending(limit = 5) {
    const claimed: string[] = [];
    for (let i = 0; i < limit; i += 1) {
      const row = await prisma.$queryRaw<Array<{ id: string }>>`SELECT id FROM "AIContentQueueJob" WHERE status = 'PENDING' ORDER BY "createdAt" ASC LIMIT 1 FOR UPDATE SKIP LOCKED`;
      if (!row[0]) break;
      const id = row[0].id;
      await prisma.aIContentQueueJob.update({ where: { id }, data: { status: "PROCESSING", startedAt: new Date(), attempt: { increment: 1 } } });
      claimed.push(id);
    }
    return prisma.aIContentQueueJob.findMany({ where: { id: { in: claimed } } });
  }

  async processJob(id: string) {
    const job = await prisma.aIContentQueueJob.findUnique({ where: { id }, include: { product: true } });
    if (!job || job.status !== "PROCESSING" || !job.product) return;
    try {
      await BudgetService.checkBudget(job.userId);
      const promptJson = (job.input ?? {}) as Record<string, unknown>;
      const customPrompt = String(promptJson.customPrompt ?? "");
      if (unsafeClaimPattern.test(customPrompt)) throw new AppError("UNSAFE_CLAIM", "Unsafe claim request rejected", 422);

      const input = {
        platform: (job.platform ?? Platform.FACEBOOK).toLowerCase() as "facebook",
        tone: (job.tone ?? Tone.FRIENDLY).toLowerCase() as "friendly",
        language: (job.language ?? Language.TH).toLowerCase() as "th",
        versions: 1,
        contentLength: "medium" as const,
        product: { title: job.product.title, description: job.product.description ?? undefined, price: Number(job.product.price), currency: job.product.currency, shopName: job.product.shopName ?? undefined, category: job.product.category ?? undefined, affiliateUrl: job.product.affiliateUrl ?? undefined },
      };
      const outputs = await this.aiService.generate(input);
      await prisma.aIContentQueueJob.update({ where: { id }, data: { status: "COMPLETED", output: outputs as unknown as Prisma.InputJsonValue, completedAt: new Date(), errorSummary: null } });
      await BudgetService.logUsage(job.userId, "mock", "/scripts/ai/content-queue-worker", 0.005, JobStatus.COMPLETED, { queueJobId: id });
    } catch (error) {
      const refreshed = await prisma.aIContentQueueJob.findUnique({ where: { id } });
      if (!refreshed) return;
      const terminal = refreshed.attempt >= refreshed.maxAttempts;
      await prisma.aIContentQueueJob.update({ where: { id }, data: { status: terminal ? "FAILED" : "PENDING", failedAt: terminal ? new Date() : null, errorSummary: error instanceof AppError ? `${error.code}: ${error.message}` : "Processing failed" } });
    }
  }
}

export const aiContentQueueService = new AIContentQueueService();
