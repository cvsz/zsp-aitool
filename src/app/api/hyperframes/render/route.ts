import { NextResponse } from "next/server";
import { z } from "zod";
import { RenderJobStatus } from "@prisma/client";

import { withAuth } from "@/middleware/auth-middleware";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { hyperFrameAspectRatios, hyperFramePlatforms } from "@/lib/hyperframes/types";
import { productService } from "@/services/ProductService";
import { prisma } from "@/lib/prisma";
import { enforceHyperFramesBilling, type HyperFramesFeature } from "@/lib/hyperframes/billing";

const bodySchema = z.object({ productId: z.string().min(1), platform: z.enum(hyperFramePlatforms), aspectRatio: z.enum(hyperFrameAspectRatios), durationSeconds: z.number().int().min(3).max(60), caption: z.string().max(1200).optional(), script: z.string().max(1200).optional(), compositionHtml: z.string().optional(), highQuality: z.boolean().optional(), batchCount: z.number().int().min(1).max(20).optional(), removeWatermark: z.boolean().optional() });

export const POST = withAuth(async (request) => {
  if (!getHyperFramesRenderConfig().enabled) return NextResponse.json({ ok: false, error: { code: "RENDER_DISABLED", message: "HyperFrames render disabled" } }, { status: 503 });
  const config = getHyperFramesRenderConfig();
  const pendingCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } });
  if (pendingCount >= config.maxPendingJobs) return NextResponse.json({ ok: false, error: { code: "QUEUE_LIMIT", message: "HyperFrames queue limit reached" } }, { status: 429 });
  const payload = bodySchema.parse(await request.json());

  const requiredFeatures: HyperFramesFeature[] = [];
  if (payload.highQuality) requiredFeatures.push("high_quality");
  if ((payload.batchCount ?? 1) > 1) requiredFeatures.push("batch_render");
  if (payload.durationSeconds > 15) requiredFeatures.push("long_duration");
  if (payload.removeWatermark) requiredFeatures.push("watermark_removal");

  if (requiredFeatures.length > 0) {
    const billingGate = enforceHyperFramesBilling(request, requiredFeatures);
    if (!billingGate.allowed) {
      return NextResponse.json({ ok: false, error: { code: billingGate.reason, message: billingGate.message, details: { requiredFeatures: billingGate.missingFeatures } } }, { status: billingGate.reason === "QUOTA_EXCEEDED" ? 429 : 402 });
    }
  }
  const product = await productService.getById(request.auth.userId, payload.productId);
  const composition = payload.compositionHtml ? { compositionHtml: payload.compositionHtml, metadata: { ...payload, productTitle: product.title, width: 0, height: 0, hasAffiliateDisclosure: false } } : buildHyperFrameComposition({ ...payload, product: { title: product.title, price: String(product.price), currency: product.currency, imageUrl: product.images[0]?.url, affiliateUrl: product.affiliateUrl } });
  const job = await prisma.hyperFrameRenderJob.create({ data: { userId: request.auth.userId, productId: product.id, status: RenderJobStatus.PENDING, compositionHtml: composition.compositionHtml, compositionMetadata: composition.metadata as object } });
  return NextResponse.json({ ok: true, data: { jobId: job.id, status: job.status } });
});
