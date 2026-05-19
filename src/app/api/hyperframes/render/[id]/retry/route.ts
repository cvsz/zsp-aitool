import { NextResponse } from "next/server";
import { RenderJobStatus } from "@prisma/client";

import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { canManage, resolveScope, scopedRenderJobWhere } from "@/lib/hyperframes/org-access";
import { isRetryableStatus } from "@/lib/hyperframes/retry";
import { enforceRenderLimits } from "@/lib/hyperframes/subscription-limits";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const config = getHyperFramesRenderConfig();
  if (!config.enabled) return NextResponse.json({ ok: false, error: { code: "RENDER_DISABLED", message: "HyperFrames render disabled" } }, { status: 503 });

  const { id } = await context.params;
  const orgId = new URL(request.url).searchParams.get("orgId");
  const scope = await resolveScope(request.auth.userId, orgId);
  if (!scope) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });

  const existing = await prisma.hyperFrameRenderJob.findFirst({ where: scopedRenderJobWhere(scope, { id }) });
  if (!existing) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (!canManage(scope)) return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Insufficient role" } }, { status: 403 });
  if (!isRetryableStatus(existing.status)) return NextResponse.json({ ok: false, error: { code: "INVALID_STATUS", message: "Only FAILED or CANCELLED jobs can be retried" } }, { status: 409 });
  if (existing.attempts >= config.maxAttempts) return NextResponse.json({ ok: false, error: { code: "MAX_ATTEMPTS_REACHED", message: "Retry attempt limit reached" } }, { status: 409 });

  const pendingCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } });
  if (pendingCount >= config.maxPendingJobs) return NextResponse.json({ ok: false, error: { code: "QUEUE_LIMIT", message: "HyperFrames queue limit reached" } }, { status: 429 });

  const limitCheck = await enforceRenderLimits({ userId: request.auth.userId, durationSeconds: existing.durationSeconds ?? 0 });
  if (!limitCheck.allowed) return NextResponse.json({ ok: false, error: { code: limitCheck.code, message: limitCheck.message }, data: { plan: limitCheck.plan, limits: limitCheck.limits, usage: limitCheck.usage } }, { status: limitCheck.status });

  const updated = await prisma.hyperFrameRenderJob.update({
    where: { id: existing.id },
    data: { status: RenderJobStatus.PENDING, errorMessage: null, failedAt: null, completedAt: null, startedAt: null, lockedAt: null, lockedBy: null, outputPath: null, outputUrl: null },
  });

  return NextResponse.json({ ok: true, data: { jobId: updated.id, status: updated.status, attempts: updated.attempts } });
});
