import { NextResponse } from "next/server";
import { RenderJobStatus } from "@prisma/client";

import { failure, success } from "@/lib/api-response";
import { canAccessOperatorControls, isOperatorControlsEnabled } from "@/lib/hyperframes/operator-access";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth-middleware";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  if (!isOperatorControlsEnabled()) {
    return NextResponse.json(failure("FORBIDDEN", "Operator controls disabled"), { status: 403 });
  }
  if (!canAccessOperatorControls(request)) {
    return NextResponse.json(failure("FORBIDDEN", "Operator access required"), { status: 403 });
  }

  const { id } = await context.params;
  const confirm = new URL(request.url).searchParams.get("confirm");
  const existing = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });
  if (!existing) return NextResponse.json(failure("NOT_FOUND", "Render job not found"), { status: 404 });
  if (existing.status !== RenderJobStatus.PENDING) return NextResponse.json(failure("INVALID_STATUS", "Only PENDING jobs can be cancelled"), { status: 409 });
  if (confirm !== "true") return NextResponse.json(failure("CONFIRMATION_REQUIRED", "Explicit operator confirmation required"), { status: 400 });

  const updated = await prisma.hyperFrameRenderJob.update({ where: { id }, data: { status: RenderJobStatus.CANCELLED } });
  return NextResponse.json(success({ jobId: updated.id, status: updated.status }));
});
