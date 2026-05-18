import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createRenderShareToken, isRenderShareEnabled } from "@/lib/hyperframes/share-token";

const schema = z.object({ expiresInHours: z.number().int().min(1).max(168).default(24) });

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  if (!isRenderShareEnabled()) return NextResponse.json({ ok: false, error: { code: "SHARE_DISABLED", message: "Public share disabled" } }, { status: 404 });
  const { id } = await context.params;
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, status: "COMPLETED", deletedAt: null } });
  if (!job || !job.outputPath) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  const input = schema.parse(await request.json().catch(() => ({})));
  const { token, tokenHash } = createRenderShareToken();
  const expiresAt = new Date(Date.now() + input.expiresInHours * 3600000);
  const share = await prisma.hyperFrameRenderShare.create({ data: { userId: request.auth.userId, renderJobId: id, tokenHash, expiresAt } });
  return NextResponse.json({ ok: true, data: { id: share.id, url: `/api/hyperframes/share/${token}`, expiresAt: share.expiresAt } });
});

export const DELETE = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  await prisma.hyperFrameRenderShare.updateMany({ where: { renderJobId: id, userId: request.auth.userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return NextResponse.json({ ok: true, data: { revoked: true } });
});
