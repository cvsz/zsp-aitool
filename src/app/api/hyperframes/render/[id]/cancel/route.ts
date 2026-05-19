import { NextResponse } from "next/server";
import { RenderJobStatus } from "@prisma/client";
import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { canManage, resolveScope } from "@/lib/hyperframes/org-access";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const orgId = new URL(request.url).searchParams.get("orgId");
  const scope = await resolveScope(request.auth.userId, orgId);
  if (!scope) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  const existing = await prisma.hyperFrameRenderJob.findFirst({ where: { id, deletedAt: null, ...(scope.orgId ? { orgId: scope.orgId } : { userId: request.auth.userId, orgId: null }) } });
  if (!existing) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (!canManage(scope)) return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Insufficient role" } }, { status: 403 });
  if (existing.status !== RenderJobStatus.PENDING) return NextResponse.json({ ok: false, error: { code: "INVALID_STATUS", message: "Only PENDING jobs can be cancelled" } }, { status: 409 });
  const updated = await prisma.hyperFrameRenderJob.update({ where: { id }, data: { status: RenderJobStatus.CANCELLED } });
  return NextResponse.json({ ok: true, data: { jobId: updated.id, status: updated.status } });
});
