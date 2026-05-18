import { NextResponse } from "next/server";
import { z } from "zod";
import { RenderJobStatus } from "@prisma/client";

import { withAuth } from "@/middleware/auth-middleware";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { hyperFrameAspectRatios, hyperFramePlatforms } from "@/lib/hyperframes/types";
import { productService } from "@/services/ProductService";
import { prisma } from "@/lib/prisma";
import { getUserHyperFramesPlan, getUserPlanUsage } from "@/lib/hyperframes/subscription-limits";

const bodySchema = z.object({ productId: z.string().min(1), platform: z.enum(hyperFramePlatforms), aspectRatio: z.enum(hyperFrameAspectRatios), durationSeconds: z.number().int().min(3).max(300), caption: z.string().max(1200).optional(), script: z.string().max(1200).optional(), compositionHtml: z.string().optional() });

export const POST = withAuth(async (request) => {
  if (!getHyperFramesRenderConfig().enabled) return NextResponse.json({ ok: false, error: { code: "RENDER_DISABLED", message: "HyperFrames render disabled" } }, { status: 503 });
  const config = getHyperFramesRenderConfig();
  const pendingCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } });
  if (pendingCount >= config.maxPendingJobs) return NextResponse.json({ ok: false, error: { code: "QUEUE_LIMIT", message: "HyperFrames queue limit reached" } }, { status: 429 });
  const payload = bodySchema.parse(await request.json());
  const plan = await getUserHyperFramesPlan(request.auth.userId);
  const usage = await getUserPlanUsage(request.auth.userId, plan);
  if (payload.durationSeconds > usage.limits.maxDurationSeconds) {
    return NextResponse.json({ ok: false, error: { code: "PLAN_DURATION_LIMIT", message: `Plan ${plan} allows duration up to ${usage.limits.maxDurationSeconds}s` } }, { status: 402 });
  }
  if (usage.monthCount >= usage.limits.monthlyRenders) {
    return NextResponse.json({ ok: false, error: { code: "PLAN_MONTHLY_LIMIT", message: `Monthly render quota exceeded for ${plan}` } }, { status: 402 });
  }
  if (usage.runningCount >= usage.limits.maxConcurrentJobs) {
    return NextResponse.json({ ok: false, error: { code: "PLAN_CONCURRENCY_LIMIT", message: `Concurrent render limit reached for ${plan}` } }, { status: 429 });
  }

  const product = await productService.getById(request.auth.userId, payload.productId);
  const composition = payload.compositionHtml ? { compositionHtml: payload.compositionHtml, metadata: { ...payload, productTitle: product.title, width: 0, height: 0, hasAffiliateDisclosure: false } } : buildHyperFrameComposition({ ...payload, product: { title: product.title, price: String(product.price), currency: product.currency, imageUrl: product.images[0]?.url, affiliateUrl: product.affiliateUrl } });
  const job = await prisma.hyperFrameRenderJob.create({ data: { userId: request.auth.userId, productId: product.id, status: RenderJobStatus.PENDING, compositionHtml: composition.compositionHtml, compositionMetadata: { ...composition.metadata, planLimits: usage.limits } as object } });
  return NextResponse.json({ ok: true, data: { jobId: job.id, status: job.status, quota: { plan, usage: usage.monthCount + 1, monthlyRenders: usage.limits.monthlyRenders, remaining: Math.max(0, usage.limits.monthlyRenders - usage.monthCount - 1) } } });
});
