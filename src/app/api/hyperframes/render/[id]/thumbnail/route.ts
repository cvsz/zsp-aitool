import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

import { withAuth, type AuthenticatedRequest } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import {
  getArtifactContentType,
  openArtifactStream,
  resolveRenderArtifactPath,
} from "@/lib/hyperframes/artifact-access";

async function resolveThumbnail(request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }, headOnly = false) {
  const { id } = await context.params;
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null } });

  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (job.status !== "COMPLETED") return NextResponse.json({ ok: false, error: { code: "RENDER_NOT_READY", message: "Render is not completed" } }, { status: 409 });
  if (!job.outputPath) return NextResponse.json({ ok: false, error: { code: "THUMBNAIL_GONE", message: "Render thumbnail is unavailable" } }, { status: 410 });

  const config = getHyperFramesRenderConfig();
  const thumbnailPath = `${job.outputPath.replace(/\.[^/.]+$/, "")}.jpg`;

  let artifactPath: string;
  try {
    artifactPath = await resolveRenderArtifactPath(config.outputDir, thumbnailPath, 20);
  } catch (error) {
    const code = error instanceof Error ? error.message : "ARTIFACT_NOT_FOUND";
    if (code === "ENOENT") return NextResponse.json({ ok: false, error: { code: "THUMBNAIL_NOT_FOUND", message: "Render thumbnail not found" } }, { status: 404 });
    return NextResponse.json({ ok: false, error: { code: "THUMBNAIL_UNAVAILABLE", message: "Render thumbnail is unavailable" } }, { status: 410 });
  }

  const headers = new Headers({
    "Content-Type": getArtifactContentType(artifactPath),
    "Content-Disposition": `inline; filename="hyperframes-render-${job.id}.jpg"`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  });

  if (headOnly) return new NextResponse(null, { status: 200, headers });

  const stream = openArtifactStream(artifactPath);
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, { status: 200, headers });
}

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => resolveThumbnail(request, context));
export const HEAD = withAuth(async (request, context: { params: Promise<{ id: string }> }) => resolveThumbnail(request, context, true));
