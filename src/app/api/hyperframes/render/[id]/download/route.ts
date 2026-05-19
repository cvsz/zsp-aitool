import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

import { withAuth, type AuthenticatedRequest } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { resolveScope, scopedRenderJobWhere } from "@/lib/hyperframes/org-access";
import { buildSafeArtifactFilename, getArtifactContentType, openArtifactStream, resolveRenderArtifactPath } from "@/lib/hyperframes/artifact-access";
import { getHyperFramesDownloadTokenConfig, verifyDownloadToken } from "@/lib/hyperframes/download-token";

async function resolveDownload(request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }, headOnly = false) {
  const { id } = await context.params;
  const searchParams = new URL(request.url).searchParams;
  const orgId = searchParams.get("orgId");
  const signedDownloads = getHyperFramesDownloadTokenConfig();
  const token = searchParams.get("token");

  if (signedDownloads.enabled && token) {
    const payload = verifyDownloadToken(token, signedDownloads);
    if (payload.jobId !== id || payload.userId !== request.auth.userId) return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid download token" } }, { status: 401 });
  }

  const scope = await resolveScope(request.auth.userId, orgId);
  if (!scope) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: scopedRenderJobWhere(scope, { id }) });
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
  return new NextResponse(Readable.toWeb(openArtifactStream(artifactPath)) as ReadableStream, { status: 200, headers });
}

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try { return await resolveDownload(request, context); } catch (error) {
    const code = error instanceof Error ? error.message : "DOWNLOAD_TOKEN_INVALID";
    if (code === "DOWNLOAD_TOKEN_INVALID" || code === "DOWNLOAD_TOKEN_EXPIRED") return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired download token" } }, { status: 401 });
    throw error;
  }
});

export const HEAD = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try { return await resolveDownload(request, context, true); } catch (error) {
    const code = error instanceof Error ? error.message : "DOWNLOAD_TOKEN_INVALID";
    if (code === "DOWNLOAD_TOKEN_INVALID" || code === "DOWNLOAD_TOKEN_EXPIRED") return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired download token" } }, { status: 401 });
    throw error;
  }
});
