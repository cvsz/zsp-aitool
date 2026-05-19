import { NextResponse } from "next/server";
import { RenderJobStatus } from "@prisma/client";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { hyperFrameAspectRatios, hyperFramePlatforms } from "@/lib/hyperframes/types";
import { productService } from "@/services/ProductService";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

const itemSchema = z.object({
  productId: z.string().min(1),
  platform: z.enum(hyperFramePlatforms),
  aspectRatio: z.enum(hyperFrameAspectRatios),
  durationSeconds: z.number().int().min(3).max(60),
  caption: z.string().max(1200).optional(),
  script: z.string().max(1200).optional(),
}).strict();

const bodySchema = z.object({ items: z.array(itemSchema).min(1) }).strict();

type BatchResult = {
  productId: string;
  status: "queued" | "skipped" | "failed_validation";
  jobId?: string;
  reason?: string;
};

export const POST = withAuth(async (request) => {
  const config = getHyperFramesRenderConfig();
  if (!config.enabled) {
    return NextResponse.json({ ok: false, error: { code: "RENDER_DISABLED", message: "HyperFrames render disabled" } }, { status: 503 });
  }

  const payload = bodySchema.parse(await request.json());
  if (payload.items.length > config.maxBatchSize) {
    return NextResponse.json({ ok: false, error: { code: "MAX_BATCH_SIZE", message: `Batch size exceeds ${config.maxBatchSize}` } }, { status: 400 });
  }

  let globalPending = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } });
  let userPending = await prisma.hyperFrameRenderJob.count({ where: { userId: request.auth.userId, status: RenderJobStatus.PENDING, deletedAt: null } });

  const results: BatchResult[] = [];
  for (const item of payload.items) {
    if (globalPending >= config.maxPendingJobs) {
      results.push({ productId: item.productId, status: "skipped", reason: "queue_limit" });
      continue;
    }
    if (userPending >= config.maxPendingPerUser) {
      results.push({ productId: item.productId, status: "skipped", reason: "quota_limit" });
      continue;
    }

    try {
      const product = await productService.getById(request.auth.userId, item.productId);
      const composition = buildHyperFrameComposition({
        ...item,
        product: {
          title: product.title,
          price: String(product.price),
          currency: product.currency,
          imageUrl: product.images[0]?.url,
          affiliateUrl: product.affiliateUrl,
        },
      });
      const job = await prisma.hyperFrameRenderJob.create({
        data: {
          userId: request.auth.userId,
          productId: product.id,
          status: RenderJobStatus.PENDING,
          compositionHtml: composition.compositionHtml,
          compositionMetadata: composition.metadata as object,
        },
      });
      globalPending += 1;
      userPending += 1;
      results.push({ productId: item.productId, status: "queued", jobId: job.id });
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        results.push({ productId: item.productId, status: "skipped", reason: "not_found" });
      } else if (error instanceof z.ZodError) {
        results.push({ productId: item.productId, status: "failed_validation", reason: "invalid_payload" });
      } else {
        results.push({ productId: item.productId, status: "failed_validation", reason: "compose_failed" });
      }
    }
  }

  const hasQueued = results.some((x) => x.status === "queued");
  const statusCode = hasQueued ? 207 : 400;
  return NextResponse.json({ ok: hasQueued, data: { results } }, { status: statusCode });
});
