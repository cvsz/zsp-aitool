import { NextResponse } from "next/server";

import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { canManage, resolveScope, scopedRenderJobWhere } from "@/lib/hyperframes/org-access";
import { isRetryableStatus } from "@/lib/hyperframes/retry";

const safeError = (message?: string | null) => message ? message.replace(/\/var\/lib\/[\w\-/.]+/g, "[redacted-path]").replace(/\s+/g, " ").trim().slice(0, 220) : null;

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const orgId = new URL(request.url).searchParams.get("orgId");
  const scope = await resolveScope(request.auth.userId, orgId);
  if (!scope) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });

  const job = await prisma.hyperFrameRenderJob.findFirst({ where: scopedRenderJobWhere(scope, { id }) });
  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });

  const config = getHyperFramesRenderConfig();
  const canDownload = job.status === "COMPLETED" && Boolean(job.outputPath);
  const manageable = canManage(scope);
  return NextResponse.json({ ok: true, data: { id: job.id, orgId: job.orgId, ownerUserId: job.userId, status: job.status, attempts: job.attempts, durationSeconds: job.durationSeconds, width: job.width, height: job.height, createdAt: job.createdAt, startedAt: job.startedAt, completedAt: job.completedAt, failedAt: job.failedAt, errorMessage: safeError(job.errorMessage), canDownload, downloadUrl: canDownload ? `/api/hyperframes/render/${job.id}/download${scope.orgId ? `?orgId=${encodeURIComponent(scope.orgId)}` : ""}` : null, canCancel: job.status === "PENDING" && manageable, canRetry: isRetryableStatus(job.status) && job.attempts < config.maxAttempts && manageable, metadata: job.compositionMetadata && typeof job.compositionMetadata === "object" ? job.compositionMetadata : null } });
});
