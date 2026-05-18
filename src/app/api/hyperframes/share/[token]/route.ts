import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { buildSafeArtifactFilename, getArtifactContentType, openArtifactStream, resolveRenderArtifactPath } from "@/lib/hyperframes/artifact-access";
import { hashRenderShareToken, isRenderShareEnabled } from "@/lib/hyperframes/share-token";

async function handle(token: string, headOnly=false) {
  if (!isRenderShareEnabled()) return NextResponse.json({ ok:false, error:{code:"NOT_FOUND",message:"Not found"}}, {status:404});
  const tokenHash = hashRenderShareToken(token);
  const share = await prisma.hyperFrameRenderShare.findUnique({ where: { tokenHash }, include: { renderJob: true } });
  if (!share) return NextResponse.json({ ok:false, error:{code:"NOT_FOUND",message:"Not found"}}, {status:404});
  if (share.revokedAt) return NextResponse.json({ ok:false, error:{code:"REVOKED",message:"Link revoked"}}, {status:410});
  if (share.expiresAt.getTime() < Date.now()) return NextResponse.json({ ok:false, error:{code:"EXPIRED",message:"Link expired"}}, {status:410});
  const job=share.renderJob;
  if (job.status!=="COMPLETED" || !job.outputPath) return NextResponse.json({ok:false,error:{code:"NOT_FOUND",message:"Not found"}},{status:404});
  const config=getHyperFramesRenderConfig();
  let artifactPath:string;
  try { artifactPath = await resolveRenderArtifactPath(config.outputDir, job.outputPath, config.maxOutputMb); }
  catch { return NextResponse.json({ok:false,error:{code:"NOT_FOUND",message:"Not found"}},{status:404}); }
  const extension = path.extname(artifactPath).toLowerCase();
  const headers = new Headers({"Content-Type":getArtifactContentType(artifactPath),"Content-Disposition":`attachment; filename="${buildSafeArtifactFilename(job.id, extension)}"`,"Cache-Control":"public, max-age=60","X-Content-Type-Options":"nosniff"});
  if (headOnly) return new NextResponse(null,{status:200,headers});
  return new NextResponse(Readable.toWeb(openArtifactStream(artifactPath)) as ReadableStream,{status:200,headers});
}

export async function GET(_:Request, context:{params:Promise<{token:string}>}) { return handle((await context.params).token); }
export async function HEAD(_:Request, context:{params:Promise<{token:string}>}) { return handle((await context.params).token, true); }
