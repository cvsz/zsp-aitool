import { RenderJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

async function main(): Promise<void> {
  const config = getHyperFramesRenderConfig();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [pending, running, completedLast24h, failedLast24h, oldestPending] = await Promise.all([
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.COMPLETED, completedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.FAILED, failedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.PENDING, deletedAt: null }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);
  console.log(JSON.stringify({ pending, running, completedLast24h, failedLast24h, oldestPendingCreatedAt: oldestPending?.createdAt?.toISOString() ?? null, outputDir: config.outputDir, renderEnabled: config.enabled }, null, 2));
}

main().catch((error: unknown) => {
  console.error(`[FAIL] ${error instanceof Error ? error.message : "queue status failed"}`);
  process.exit(1);
});
