import { NextResponse } from "next/server";
import { z } from "zod";
import { RenderJobStatus } from "@prisma/client";

import { withAuth } from "@/middleware/auth-middleware";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { hyperFrameAspectRatios, hyperFramePlatforms } from "@/lib/hyperframes/types";
import { hyperFramesQualityProfiles, resolveRenderQuality } from "@/lib/hyperframes/render-quality";
import { productService } from "@/services/ProductService";
import { prisma } from "@/lib/prisma";
import { hyperframesVoiceoverSchema, isTtsEnabled } from "@/lib/hyperframes/voiceover";

const bodySchema = z.object({ productId: z.string().min(1), platform: z.enum(hyperFramePlatforms), aspectRatio: z.enum(hyperFrameAspectRatios), durationSeconds: z.number().int().min(3).max(60), caption: z.string().max(1200).optional(), script: z.string().max(1200).optional(), compositionHtml: z.string().optional(), voiceover: hyperframesVoiceoverSchema.optional() });
import { getHyperframesBrandKit } from "@/services/hyperframes-brand-kit-service";
import { HyperFramesQuotaService } from "@/services/HyperFramesQuotaService";

const bodySchema = z.object({ productId: z.string().min(1), platform: z.enum(hyperFramePlatforms), aspectRatio: z.enum(hyperFrameAspectRatios), durationSeconds: z.number().int().min(3).max(60), caption: z.string().max(1200).optional(), script: z.string().max(1200).optional(), compositionHtml: z.string().optional(), qualityProfile: z.enum(hyperFramesQualityProfiles).optional() });
const bodySchema = z.object({ productId: z.string().min(1), platform: z.enum(hyperFramePlatforms), aspectRatio: z.enum(hyperFrameAspectRatios), durationSeconds: z.number().int().min(3).max(60), caption: z.string().max(1200).optional(), script: z.string().max(1200).optional() }).strict();

export const POST = withAuth(async (request) => {
  if (!getHyperFramesRenderConfig().enabled) return NextResponse.json({ ok: false, error: { code: "RENDER_DISABLED", message: "HyperFrames render disabled" } }, { status: 503 });
  const config = getHyperFramesRenderConfig();
  const pendingCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } });
  if (pendingCount >= config.maxPendingJobs) return NextResponse.json({ ok: false, error: { code: "QUEUE_LIMIT", message: "HyperFrames queue limit reached" } }, { status: 429 });
  const quota = await HyperFramesQuotaService.enforceBeforeEnqueue(request.auth.userId);
  if (!quota.allowed) return NextResponse.json({ ok: false, error: { code: quota.code, message: quota.message }, data: { remainingMonthlyRenders: quota.summary.remainingMonthlyRenders, storageUsedMb: quota.summary.storageUsedMb, storageQuotaMb: quota.summary.storageQuotaMb, retentionDays: quota.summary.retentionDays } }, { status: 429 });
  const payload = bodySchema.parse(await request.json());
  if (!isTtsEnabled() && payload.voiceover?.source === "upload") return NextResponse.json({ ok: false, error: { code: "TTS_DISABLED", message: "voiceover provider disabled" } }, { status: 403 });
  let qualityProfile: "preview" | "standard" | "high" = "standard";
  try {
    qualityProfile = resolveRenderQuality(payload.qualityProfile, { allowedRaw: config.allowedQualityProfiles, highQualityEnabled: config.highQualityEnabled }).profile;
  } catch {
    return NextResponse.json({ ok: false, error: { code: "INVALID_QUALITY_PROFILE", message: "Quality profile is invalid or not allowed" } }, { status: 400 });
  }
  const product = await productService.getById(request.auth.userId, payload.productId);
  const composition = payload.compositionHtml ? { compositionHtml: payload.compositionHtml, metadata: { ...payload, qualityProfile, productTitle: product.title, width: 0, height: 0, hasAffiliateDisclosure: false } } : buildHyperFrameComposition({ ...payload, product: { title: product.title, price: String(product.price), currency: product.currency, imageUrl: product.images[0]?.url, affiliateUrl: product.affiliateUrl } });
  const job = await prisma.hyperFrameRenderJob.create({ data: { userId: request.auth.userId, productId: product.id, status: RenderJobStatus.PENDING, compositionHtml: composition.compositionHtml, compositionMetadata: { ...(composition.metadata as object), qualityProfile } } });
  return NextResponse.json({ ok: true, data: { jobId: job.id, status: job.status } });

  const dailyQuota = Number.parseInt(process.env.HYPERFRAMES_DAILY_USER_QUOTA ?? "0", 10);
  if (Number.isFinite(dailyQuota) && dailyQuota > 0) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const userDailyCount = await prisma.hyperFrameRenderJob.count({ where: { userId: request.auth.userId, createdAt: { gte: startOfDay }, deletedAt: null } });
    if (userDailyCount >= dailyQuota) return NextResponse.json({ ok: false, error: { code: "QUOTA_EXCEEDED", message: "HyperFrames daily quota exceeded" } }, { status: 429 });
  }

  const product = await productService.getById(request.auth.userId, payload.productId);
  const brandKit = await getHyperframesBrandKit(request.auth.userId);
  const composition = payload.compositionHtml ? { compositionHtml: payload.compositionHtml, metadata: { ...payload, productTitle: product.title, width: 0, height: 0, hasAffiliateDisclosure: false } } : buildHyperFrameComposition({ ...payload, product: { title: product.title, price: String(product.price), currency: product.currency, imageUrl: product.images[0]?.url, affiliateUrl: product.affiliateUrl }, brandKit });
  const composition = buildHyperFrameComposition({ ...payload, product: { title: product.title, price: String(product.price), currency: product.currency, imageUrl: product.images[0]?.url, affiliateUrl: product.affiliateUrl } });
  const job = await prisma.hyperFrameRenderJob.create({ data: { userId: request.auth.userId, productId: product.id, status: RenderJobStatus.PENDING, compositionHtml: composition.compositionHtml, compositionMetadata: composition.metadata as object } });
  return NextResponse.json({ ok: true, data: { jobId: job.id, status: job.status, remainingMonthlyRenders: Math.max(0, quota.summary.remainingMonthlyRenders - 1), storageUsedMb: quota.summary.storageUsedMb, storageQuotaMb: quota.summary.storageQuotaMb, retentionDays: quota.summary.retentionDays } });
});
