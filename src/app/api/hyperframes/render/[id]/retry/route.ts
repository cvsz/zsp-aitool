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
});
