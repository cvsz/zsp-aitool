import { NextResponse } from "next/server";
import { RenderJobStatus } from "@prisma/client";

import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getUserHyperFramesPlan, getUserPlanUsage } from "@/lib/hyperframes/subscription-limits";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const existing = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });
  if (!existing) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (existing.status !== RenderJobStatus.FAILED && existing.status !== RenderJobStatus.CANCELLED) {
    return NextResponse.json({ ok: false, error: { code: "INVALID_STATUS", message: "Only FAILED or CANCELLED jobs can be retried" } }, { status: 409 });
  }

  const plan = await getUserHyperFramesPlan(request.auth.userId);
  const usage = await getUserPlanUsage(request.auth.userId, plan);
  if ((existing.durationSeconds ?? 0) > usage.limits.maxDurationSeconds) {
    return NextResponse.json({ ok: false, error: { code: "PLAN_DURATION_LIMIT", message: `Plan ${plan} allows duration up to ${usage.limits.maxDurationSeconds}s` } }, { status: 402 });
  }
  if (usage.monthCount >= usage.limits.monthlyRenders) {
    return NextResponse.json({ ok: false, error: { code: "PLAN_MONTHLY_LIMIT", message: `Monthly render quota exceeded for ${plan}` } }, { status: 402 });
  }
  if (usage.runningCount >= usage.limits.maxConcurrentJobs) {
    return NextResponse.json({ ok: false, error: { code: "PLAN_CONCURRENCY_LIMIT", message: `Concurrent render limit reached for ${plan}` } }, { status: 429 });
  }

  const updated = await prisma.hyperFrameRenderJob.update({ where: { id }, data: { status: RenderJobStatus.PENDING, errorMessage: null } });
  return NextResponse.json({ ok: true, data: { jobId: updated.id, status: updated.status } });
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { enforceRenderLimits } from "@/lib/hyperframes/subscription-limits";
import { prisma } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { isRetryableStatus } from "@/lib/hyperframes/retry";

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
