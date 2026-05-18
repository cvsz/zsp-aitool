import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });
  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  const canDownload = job.status === "COMPLETED" && Boolean(job.outputPath);
  const downloadUrl = canDownload ? `/api/hyperframes/render/${job.id}/download` : undefined;
  return NextResponse.json({ ok: true, data: { ...job, outputPath: undefined, outputUrl: undefined, canDownload, downloadUrl } });
});
