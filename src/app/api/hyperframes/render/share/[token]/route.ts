import { Readable } from "node:stream";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { hashShareToken } from "@/lib/hyperframes/share-token";
import { buildSafeArtifactFilename, getArtifactContentType, openArtifactStream, resolveRenderArtifactPath } from "@/lib/hyperframes/artifact-access";

async function serve(context: { params: Promise<{ token: string }> }, headOnly = false) {
  const config = getHyperFramesRenderConfig();
  if (!config.shareEnabled) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });

  const { token } = await context.params;
  const share = await prisma.hyperFrameRenderShare.findUnique({ where: { tokenHash: hashShareToken(token) }, include: { renderJob: true } });
  if (!share) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  if (share.revokedAt) return NextResponse.json({ ok: false, error: { code: "GONE", message: "Link revoked" } }, { status: 410 });
  if (share.expiresAt.getTime() <= Date.now()) return NextResponse.json({ ok: false, error: { code: "GONE", message: "Link expired" } }, { status: 410 });

  const job = share.renderJob;
  if (job.status !== "COMPLETED" || !job.outputPath) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });

  let artifactPath: string;
  try {
    artifactPath = await resolveRenderArtifactPath(config.outputDir, job.outputPath, config.maxOutputMb);
  } catch {
    return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": getArtifactContentType(artifactPath),
    "Content-Disposition": `attachment; filename="${buildSafeArtifactFilename(job.id, path.extname(artifactPath).toLowerCase())}"`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=60",
  });
  if (headOnly) return new NextResponse(null, { status: 200, headers });
  return new NextResponse(Readable.toWeb(openArtifactStream(artifactPath)) as ReadableStream, { status: 200, headers });
}

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) { return serve(context); }
export async function HEAD(_: Request, context: { params: Promise<{ token: string }> }) { return serve(context, true); }
