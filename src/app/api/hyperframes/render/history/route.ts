import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { canManage, historyWhere, resolveScope } from "@/lib/hyperframes/org-access";
import { isRetryableStatus } from "@/lib/hyperframes/retry";

const querySchema = z.object({
  status: z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  orgId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

const safeError = (message?: string | null) => message ? message.replace(/\/var\/lib\/[\w\-/.]+/g, "[redacted-path]").replace(/\s+/g, " ").trim().slice(0, 220) : null;
const safeMetadata = (metadata: unknown): Record<string, unknown> | null => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = metadata as Record<string, unknown>;
  return {
    platform: typeof value.platform === "string" ? value.platform : undefined,
    aspectRatio: typeof value.aspectRatio === "string" ? value.aspectRatio : undefined,
    durationSeconds: typeof value.durationSeconds === "number" ? value.durationSeconds : undefined,
    qualityProfile: typeof value.qualityProfile === "string" ? value.qualityProfile : undefined,
  };
};

const safeThumbnailUrl = (job: { id: string; status: string; compositionMetadata: unknown }): string | null => {
  if (job.status !== "COMPLETED") return null;
  if (!job.compositionMetadata || typeof job.compositionMetadata !== "object" || Array.isArray(job.compositionMetadata)) return null;
  const thumbnailName = (job.compositionMetadata as Record<string, unknown>).thumbnailName;
  if (typeof thumbnailName !== "string" || !/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png)$/.test(thumbnailName)) return null;
  return `/api/hyperframes/render/${job.id}/thumbnail`;
};

export const GET = withAuth(async (request) => {
  const parsedQuery = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
  if (!parsedQuery.success) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_QUERY", message: "Invalid query parameters", details: parsedQuery.error.flatten() } },
      { status: 422 },
    );
  }
  const parsed = parsedQuery.data;
  const scope = await resolveScope(request.auth.userId, parsed.orgId);
  if (!scope) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });

  const config = getHyperFramesRenderConfig();
  const jobs = await prisma.hyperFrameRenderJob.findMany({
    where: { ...historyWhere(scope), ...(parsed.status ? { status: parsed.status } : {}) },
    orderBy: { createdAt: "desc" },
    take: parsed.limit + 1,
    ...(parsed.cursor ? { cursor: { id: parsed.cursor }, skip: 1 } : {}),
  });
  const hasMore = jobs.length > parsed.limit;
  const items = jobs.slice(0, parsed.limit);
  const manageable = canManage(scope);

  return NextResponse.json({
    ok: true,
    data: {
      scope: { orgId: scope.orgId, role: scope.role },
      items: items.map((job) => {
        const canDownload = job.status === "COMPLETED" && Boolean(job.outputPath);
        return {
          id: job.id,
          orgId: job.orgId,
          status: job.status,
          attempts: job.attempts,
          durationSeconds: job.durationSeconds,
          width: job.width,
          height: job.height,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          failedAt: job.failedAt,
          errorMessage: safeError(job.errorMessage),
          canDownload,
          downloadUrl: canDownload ? `/api/hyperframes/render/${job.id}/download${scope.orgId ? `?orgId=${encodeURIComponent(scope.orgId)}` : ""}` : null,
          thumbnailUrl: safeThumbnailUrl(job) ?? (canDownload ? `/api/hyperframes/render/${job.id}/thumbnail${scope.orgId ? `?orgId=${encodeURIComponent(scope.orgId)}` : ""}` : null),
          canCancel: job.status === "PENDING" && manageable,
          canRetry: isRetryableStatus(job.status) && job.attempts < config.maxAttempts && manageable,
          metadata: safeMetadata(job.compositionMetadata),
        };
      }),
      pageInfo: { hasMore, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null },
    },
  });
});
