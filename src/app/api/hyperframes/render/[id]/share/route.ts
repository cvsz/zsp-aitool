import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { createShareToken, hashShareToken } from "@/lib/hyperframes/share-token";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const config = getHyperFramesRenderConfig();
  if (!config.shareEnabled) return NextResponse.json({ ok: false, error: { code: "SHARE_DISABLED", message: "Share links are disabled" } }, { status: 404 });

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { expiresInSeconds?: number };
  const expiresInSeconds = typeof body.expiresInSeconds === "number" ? Math.floor(body.expiresInSeconds) : 3600;
  if (expiresInSeconds < 60 || expiresInSeconds > 60 * 60 * 24 * 30) {
    return NextResponse.json({ ok: false, error: { code: "INVALID_EXPIRES", message: "expiresInSeconds must be between 60 and 2592000" } }, { status: 400 });
  }

  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });
  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (job.status !== "COMPLETED" || !job.outputPath) return NextResponse.json({ ok: false, error: { code: "RENDER_NOT_READY", message: "Render is not completed" } }, { status: 409 });

  const token = createShareToken();
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  await prisma.hyperFrameRenderShare.create({
    data: { renderJobId: job.id, ownerUserId: request.auth.userId, tokenHash: hashShareToken(token), expiresAt },
  });

  return NextResponse.json({ ok: true, data: { token, url: `/api/hyperframes/render/share/${token}`, expiresAt } });
});

export const DELETE = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const result = await prisma.hyperFrameRenderShare.updateMany({
    where: { renderJobId: id, ownerUserId: request.auth.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  if (result.count === 0) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Share link not found" } }, { status: 404 });
  return NextResponse.json({ ok: true, data: { revoked: true } });
});
