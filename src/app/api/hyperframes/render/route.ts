import { NextResponse } from "next/server";
import { z } from "zod";
import { RenderJobStatus } from "@prisma/client";

import { withAuth } from "@/middleware/auth-middleware";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { hyperFrameAspectRatios, hyperFramePlatforms, hyperFrameWatermarkPositions } from "@/lib/hyperframes/types";
import { hyperframesVoiceoverSchema, isTtsEnabled } from "@/lib/hyperframes/voiceover";
import { hyperFramesQualityProfiles, resolveRenderQuality } from "@/lib/hyperframes/render-quality";
import { enforceRenderLimits } from "@/lib/hyperframes/subscription-limits";
import { canManage, resolveScope } from "@/lib/hyperframes/org-access";
import { prisma } from "@/lib/prisma";
import { productService } from "@/services/ProductService";
import { getHyperframesBrandKit } from "@/services/hyperframes-brand-kit-service";
import { HyperFramesQuotaService } from "@/services/HyperFramesQuotaService";

const bodySchema = z.object({
  orgId: z.string().min(1).optional(),
  productId: z.string().min(1),
  platform: z.enum(hyperFramePlatforms),
  aspectRatio: z.enum(hyperFrameAspectRatios),
  durationSeconds: z.number().int().min(3).max(300),
  caption: z.string().max(1200).optional(),
  script: z.string().max(1200).optional(),
  qualityProfile: z.enum(hyperFramesQualityProfiles).optional(),
  voiceover: hyperframesVoiceoverSchema.optional(),
  watermark: z.object({
    text: z.string().max(80).optional(),
    logoUrl: z.string().url().max(1000).optional(),
    position: z.enum(hyperFrameWatermarkPositions).optional(),
  }).optional(),
}).strict();

function jsonError(code: string, message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: { code, message, ...(details ? { details } : {}) } }, { status });
}

export const POST = withAuth(async (request) => {
  const config = getHyperFramesRenderConfig();
  if (!config.enabled) return jsonError("RENDER_DISABLED", "HyperFrames render disabled", 503);

  const parsedBody = bodySchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonError("INVALID_BODY", "Invalid request body", 422, { validation: parsedBody.error.flatten() });
  }
  const payload = parsedBody.data;
  const scope = await resolveScope(request.auth.userId, payload.orgId);
  if (!scope) return jsonError("NOT_FOUND", "Render job not found", 404);
  if (scope.orgId && !canManage(scope)) return jsonError("FORBIDDEN", "Insufficient role", 403);
  if (!isTtsEnabled() && payload.voiceover?.source === "upload") return jsonError("VOICEOVER_DISABLED", "Voiceover uploads are disabled", 422);

  const pendingCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } });
  if (pendingCount >= config.maxPendingJobs) return jsonError("QUEUE_LIMIT", "HyperFrames queue limit reached", 429);

  const quality = resolveRenderQuality(payload.qualityProfile, { allowedRaw: config.allowedQualityProfiles, highQualityEnabled: config.highQualityEnabled });
  const durationSeconds = Math.min(payload.durationSeconds, quality.spec.durationSeconds, config.maxDurationSeconds);
  const limitCheck = await enforceRenderLimits({ userId: request.auth.userId, durationSeconds });
  if (!limitCheck.allowed) return NextResponse.json({ ok: false, error: { code: limitCheck.code, message: limitCheck.message }, data: { plan: limitCheck.plan, limits: limitCheck.limits, usage: limitCheck.usage } }, { status: limitCheck.status });

  const quota = await HyperFramesQuotaService.enforceBeforeEnqueue(request.auth.userId);
  if (!quota.allowed) {
    return NextResponse.json({ ok: false, error: { code: quota.code, message: quota.message }, data: { remainingMonthlyRenders: quota.summary.remainingMonthlyRenders, storageUsedMb: quota.summary.storageUsedMb, storageQuotaMb: quota.summary.storageQuotaMb, retentionDays: quota.summary.retentionDays } }, { status: 429 });
  }

  const product = await productService.getById(request.auth.userId, payload.productId);
  const brandKit = await getHyperframesBrandKit(request.auth.userId);
  const composition = buildHyperFrameComposition({ ...payload, durationSeconds, brandKit, product: { title: product.title, price: String(product.price), currency: product.currency, imageUrl: product.images[0]?.url, affiliateUrl: product.affiliateUrl } });

  const job = await prisma.hyperFrameRenderJob.create({
    data: {
      userId: request.auth.userId,
      orgId: scope.orgId,
      productId: product.id,
      status: RenderJobStatus.PENDING,
      compositionHtml: composition.compositionHtml,
      compositionMetadata: { ...composition.metadata, qualityProfile: quality.profile, planLimits: limitCheck.limits } as object,
      durationSeconds,
      width: composition.metadata.width,
      height: composition.metadata.height,
    },
  });

  return NextResponse.json({ ok: true, data: { jobId: job.id, status: job.status, orgId: job.orgId, quota: { remainingMonthlyRenders: quota.summary.remainingMonthlyRenders - 1, storageUsedMb: quota.summary.storageUsedMb, storageQuotaMb: quota.summary.storageQuotaMb, retentionDays: quota.summary.retentionDays } } });
});
