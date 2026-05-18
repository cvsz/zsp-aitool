import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { isRetryableStatus } from "@/lib/hyperframes/retry";

const querySchema = z.object({ status: z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]).optional(), limit: z.coerce.number().int().min(1).max(100).default(20), cursor: z.string().min(1).optional() });
const safeError = (message?: string | null) => message ? message.replace(/\/var\/lib\/[\w\-/.]+/g, "[redacted-path]").replace(/\s+/g, " ").trim().slice(0, 220) : null;
const safeMetadata = (metadata: unknown): Record<string, unknown> | null => (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) ? null : { platform: typeof (metadata as Record<string, unknown>).platform === "string" ? (metadata as Record<string, unknown>).platform : undefined, aspectRatio: typeof (metadata as Record<string, unknown>).aspectRatio === "string" ? (metadata as Record<string, unknown>).aspectRatio : undefined };
const safeThumbnailUrl = (job: { id: string; status: string; compositionMetadata: unknown }): string | null => {
  if (job.status !== "COMPLETED") return null;
  if (!job.compositionMetadata || typeof job.compositionMetadata !== "object" || Array.isArray(job.compositionMetadata)) return null;
  const thumbnailName = (job.compositionMetadata as Record<string, unknown>).thumbnailName;
  if (typeof thumbnailName !== "string" || !/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png)$/.test(thumbnailName)) return null;
  return `/api/hyperframes/render/${job.id}/thumbnail`;
};

export const GET = withAuth(async (request) => {
  const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
  const config = getHyperFramesRenderConfig();
  const jobs = await prisma.hyperFrameRenderJob.findMany({ where: { userId: request.auth.userId, deletedAt: null, ...(parsed.status ? { status: parsed.status } : {}) }, orderBy: { createdAt: "desc" }, take: parsed.limit + 1, ...(parsed.cursor ? { cursor: { id: parsed.cursor }, skip: 1 } : {}) });
  const hasMore = jobs.length > parsed.limit;
  const items = jobs.slice(0, parsed.limit);

  return NextResponse.json({ ok: true, data: { items: items.map((job) => { const canDownload = job.status === "COMPLETED" && Boolean(job.outputPath); const canCancel = job.status === "PENDING"; const canRetry = (job.status === "FAILED" || job.status === "CANCELLED") && job.attempts < config.maxAttempts; return { id: job.id, status: job.status, attempts: job.attempts, durationSeconds: job.durationSeconds, width: job.width, height: job.height, createdAt: job.createdAt, startedAt: job.startedAt, completedAt: job.completedAt, failedAt: job.failedAt, errorMessage: safeError(job.errorMessage), canDownload, downloadUrl: canDownload ? `/api/hyperframes/render/${job.id}/download` : null, canCancel, canRetry, thumbnailUrl: safeThumbnailUrl(job), metadata: safeMetadata(job.compositionMetadata) }; }), pageInfo: { hasMore, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null } } });
  return NextResponse.json({ ok: true, data: { items: items.map((job) => { const canDownload = job.status === "COMPLETED" && Boolean(job.outputPath); const canCancel = job.status === "PENDING"; const canRetry = isRetryableStatus(job.status) && job.attempts < config.maxAttempts; return { id: job.id, status: job.status, attempts: job.attempts, durationSeconds: job.durationSeconds, width: job.width, height: job.height, createdAt: job.createdAt, startedAt: job.startedAt, completedAt: job.completedAt, failedAt: job.failedAt, errorMessage: safeError(job.errorMessage), canDownload, downloadUrl: canDownload ? `/api/hyperframes/render/${job.id}/download` : null, canCancel, canRetry, metadata: safeMetadata(job.compositionMetadata) }; }), pageInfo: { hasMore, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null } } });
});
