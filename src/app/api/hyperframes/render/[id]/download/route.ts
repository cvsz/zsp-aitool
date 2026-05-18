import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

import { withAuth, type AuthenticatedRequest } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import {
  buildSafeArtifactFilename,
  getArtifactContentType,
  openArtifactStream,
  resolveRenderArtifactPath,
} from "@/lib/hyperframes/artifact-access";

async function resolveDownload(request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }, headOnly = false) {
  const { id } = await context.params;
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });

  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (job.status !== "COMPLETED") return NextResponse.json({ ok: false, error: { code: "RENDER_NOT_READY", message: "Render is not completed" } }, { status: 409 });
  if (!job.outputPath) return NextResponse.json({ ok: false, error: { code: "ARTIFACT_GONE", message: "Render artifact is no longer available" } }, { status: 410 });

  const config = getHyperFramesRenderConfig();

  let artifactPath: string;
  try {
    artifactPath = await resolveRenderArtifactPath(config.outputDir, job.outputPath, config.maxOutputMb);
  } catch (error) {
    const code = error instanceof Error ? error.message : "ARTIFACT_NOT_FOUND";
    if (code === "ENOENT") return NextResponse.json({ ok: false, error: { code: "ARTIFACT_NOT_FOUND", message: "Render artifact not found" } }, { status: 404 });
    if (code === "ARTIFACT_TOO_LARGE") return NextResponse.json({ ok: false, error: { code: "ARTIFACT_TOO_LARGE", message: "Render artifact exceeds configured limits" } }, { status: 410 });
    return NextResponse.json({ ok: false, error: { code: "ARTIFACT_UNAVAILABLE", message: "Render artifact is unavailable" } }, { status: 410 });
  }

  const extension = path.extname(artifactPath).toLowerCase();
  const headers = new Headers({
    "Content-Type": getArtifactContentType(artifactPath),
    "Content-Disposition": `attachment; filename="${buildSafeArtifactFilename(job.id, extension)}"`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  });

  if (headOnly) return new NextResponse(null, { status: 200, headers });

  const stream = openArtifactStream(artifactPath);
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, { status: 200, headers });
}

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => resolveDownload(request, context));
export const HEAD = withAuth(async (request, context: { params: Promise<{ id: string }> }) => resolveDownload(request, context, true));
