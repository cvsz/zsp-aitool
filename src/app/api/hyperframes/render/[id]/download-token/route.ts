import { NextResponse } from "next/server";

import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createDownloadToken, getHyperFramesDownloadTokenConfig } from "@/lib/hyperframes/download-token";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });

  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (job.status !== "COMPLETED") return NextResponse.json({ ok: false, error: { code: "RENDER_NOT_READY", message: "Render is not completed" } }, { status: 409 });

  const cfg = getHyperFramesDownloadTokenConfig();
  if (!cfg.enabled) {
    return NextResponse.json({ ok: true, data: { token: null, expiresAt: null, downloadUrl: `/api/hyperframes/render/${job.id}/download` } });
  }

  try {
    const token = createDownloadToken(job.id, request.auth.userId, cfg);
    return NextResponse.json({
      ok: true,
      data: {
        token,
        expiresAt: new Date(Date.now() + cfg.ttlSeconds * 1000).toISOString(),
        downloadUrl: `/api/hyperframes/render/${job.id}/download?token=${encodeURIComponent(token)}`,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "TOKEN_CONFIG_INVALID", message: "Signed downloads are unavailable" } }, { status: 503 });
  }
});
