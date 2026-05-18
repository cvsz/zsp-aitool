import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { canManage, resolveScope } from "@/lib/hyperframes/org-access";
import { isRetryableStatus } from "@/lib/hyperframes/retry";

const safeError = (message?: string | null) => message ? message.replace(/\/var\/lib\/[\w\-/.]+/g, "[redacted-path]").replace(/\s+/g, " ").trim().slice(0, 220) : null;

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const orgId = new URL(request.url).searchParams.get("orgId");
  const scope = await resolveScope(request.auth.userId, orgId);
  if (!scope) return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Organization access denied" } }, { status: 403 });
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id, deletedAt: null, ...(scope.orgId ? { orgId: scope.orgId } : { userId: request.auth.userId, orgId: null }) } });
  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  const config = getHyperFramesRenderConfig();
  const canDownload = job.status === "COMPLETED" && Boolean(job.outputPath);
  const canCancel = job.status === "PENDING" && canManage(scope);
  const canRetry = (job.status === "FAILED" || job.status === "CANCELLED") && job.attempts < config.maxAttempts && canManage(scope);
  const canCancel = job.status === "PENDING";
  const canRetry = isRetryableStatus(job.status) && job.attempts < config.maxAttempts;
  return NextResponse.json({ ok: true, data: { id: job.id, status: job.status, attempts: job.attempts, durationSeconds: job.durationSeconds, width: job.width, height: job.height, createdAt: job.createdAt, startedAt: job.startedAt, completedAt: job.completedAt, failedAt: job.failedAt, errorMessage: safeError(job.errorMessage), canDownload, downloadUrl: canDownload ? `/api/hyperframes/render/${job.id}/download` : null, canCancel, canRetry, metadata: job.compositionMetadata && typeof job.compositionMetadata === "object" ? job.compositionMetadata : null } });
});
