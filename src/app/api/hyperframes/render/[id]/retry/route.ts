import { NextResponse } from "next/server";
import { RenderJobStatus } from "@prisma/client";

import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { isRetryableStatus } from "@/lib/hyperframes/retry";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  if (!getHyperFramesRenderConfig().enabled) return NextResponse.json({ ok: false, error: { code: "RENDER_DISABLED", message: "HyperFrames render disabled" } }, { status: 503 });

  const { id } = await context.params;
  const existing = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });
  if (!existing) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (!isRetryableStatus(existing.status)) return NextResponse.json({ ok: false, error: { code: "INVALID_STATUS", message: "Only FAILED or CANCELLED jobs can be retried" } }, { status: 409 });

  const config = getHyperFramesRenderConfig();
  if (existing.attempts >= config.maxAttempts) return NextResponse.json({ ok: false, error: { code: "MAX_ATTEMPTS_REACHED", message: "Retry attempt limit reached" } }, { status: 409 });

  const pendingCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } });
  if (pendingCount >= config.maxPendingJobs) return NextResponse.json({ ok: false, error: { code: "QUEUE_LIMIT", message: "HyperFrames queue limit reached" } }, { status: 429 });

  const updated = await prisma.hyperFrameRenderJob.update({
    where: { id: existing.id },
    data: {
      status: RenderJobStatus.PENDING,
      errorMessage: null,
      failedAt: null,
      completedAt: null,
      startedAt: null,
      lockedAt: null,
      lockedBy: null,
      outputPath: null,
      outputUrl: null,
    },
  });

  return NextResponse.json({ ok: true, data: { jobId: updated.id, status: updated.status, attempts: updated.attempts } });
});
