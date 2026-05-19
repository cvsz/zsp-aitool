import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

import { withAuth, type AuthenticatedRequest } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { openArtifactStream, resolveRenderArtifactPath } from "@/lib/hyperframes/artifact-access";
import { resolveScope, scopedRenderJobWhere } from "@/lib/hyperframes/org-access";

const thumbnailNamePattern = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png)$/;

function contentTypeForThumbnail(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  throw new Error("ARTIFACT_INVALID_EXTENSION");
}

async function resolveThumbnail(request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }, headOnly = false) {
  const { id } = await context.params;
  const orgId = new URL(request.url).searchParams.get("orgId");
  const scope = await resolveScope(request.auth.userId, orgId);
  if (!scope) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: scopedRenderJobWhere(scope, { id }) });
  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  if (job.status !== "COMPLETED") return NextResponse.json({ ok: false, error: { code: "RENDER_NOT_READY", message: "Render is not completed" } }, { status: 409 });
  if (!job.compositionMetadata || typeof job.compositionMetadata !== "object" || Array.isArray(job.compositionMetadata)) return NextResponse.json({ ok: false, error: { code: "THUMBNAIL_NOT_FOUND", message: "Thumbnail not available" } }, { status: 404 });
  const thumbnailName = (job.compositionMetadata as Record<string, unknown>).thumbnailName;
  if (typeof thumbnailName !== "string" || !thumbnailNamePattern.test(thumbnailName)) return NextResponse.json({ ok: false, error: { code: "THUMBNAIL_NOT_FOUND", message: "Thumbnail not available" } }, { status: 404 });

  const config = getHyperFramesRenderConfig();
  const thumbnailPath = path.join(config.outputDir, thumbnailName);
  let artifactPath: string;
  try { artifactPath = await resolveRenderArtifactPath(config.outputDir, thumbnailPath, 20); }
  catch (error) {
    const code = error instanceof Error ? error.message : "ARTIFACT_NOT_FOUND";
    if (code === "ENOENT") return NextResponse.json({ ok: false, error: { code: "THUMBNAIL_NOT_FOUND", message: "Thumbnail not available" } }, { status: 404 });
    return NextResponse.json({ ok: false, error: { code: "THUMBNAIL_UNAVAILABLE", message: "Thumbnail unavailable" } }, { status: 410 });
  }
  const headers = new Headers({ "Content-Type": contentTypeForThumbnail(artifactPath), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  if (headOnly) return new NextResponse(null, { status: 200, headers });
  return new NextResponse(Readable.toWeb(openArtifactStream(artifactPath)) as ReadableStream, { status: 200, headers });
}

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => resolveThumbnail(request, context));
export const HEAD = withAuth(async (request, context: { params: Promise<{ id: string }> }) => resolveThumbnail(request, context, true));
