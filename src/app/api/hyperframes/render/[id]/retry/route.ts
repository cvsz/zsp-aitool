import { NextResponse } from "next/server";
import { RenderJobStatus } from "@prisma/client";

import { withAuth } from "@/middleware/auth-middleware";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { enforceRenderLimits } from "@/lib/hyperframes/subscription-limits";
import { prisma } from "@/lib/prisma";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  if (!getHyperFramesRenderConfig().enabled) return NextResponse.json({ ok: false, error: { code: "RENDER_DISABLED", message: "HyperFrames render disabled" } }, { status: 503 });

  const { id } = await context.params;
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });
  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (job.status !== RenderJobStatus.FAILED && job.status !== RenderJobStatus.CANCELLED) {
    return NextResponse.json({ ok: false, error: { code: "INVALID_STATUS", message: "Only FAILED or CANCELLED jobs can be retried" } }, { status: 409 });
  }

  const limitCheck = await enforceRenderLimits({ userId: request.auth.userId, durationSeconds: job.durationSeconds ?? 0 });
  if (!limitCheck.allowed) {
    return NextResponse.json({ ok: false, error: { code: limitCheck.code, message: limitCheck.message }, data: { plan: limitCheck.plan, limits: limitCheck.limits, usage: limitCheck.usage } }, { status: limitCheck.status });
  }

  const retried = await prisma.hyperFrameRenderJob.update({ where: { id }, data: { status: RenderJobStatus.PENDING, errorMessage: null, lockedAt: null, lockedBy: null, startedAt: null, completedAt: null, failedAt: null } });
  return NextResponse.json({ ok: true, data: { jobId: retried.id, status: retried.status, plan: limitCheck.plan, limits: limitCheck.limits, usage: limitCheck.usage } });
});
