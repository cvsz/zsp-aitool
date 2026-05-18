import { RenderJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

async function main(): Promise<void> {
  const config = getHyperFramesRenderConfig();
  const threshold = new Date(Date.now() - config.runningStaleMinutes * 60 * 1000);
  const stale = await prisma.hyperFrameRenderJob.findMany({
    where: {
      status: RenderJobStatus.RUNNING,
      deletedAt: null,
      OR: [{ lockedAt: { lt: threshold } }, { startedAt: { lt: threshold } }],
    },
    select: { id: true },
  });

  if (stale.length === 0) return console.log("[SKIP] no stale running jobs found");

  const result = await prisma.hyperFrameRenderJob.updateMany({
    where: { id: { in: stale.map((j) => j.id) }, status: RenderJobStatus.RUNNING },
    data: {
      status: RenderJobStatus.FAILED,
      errorMessage: "HyperFrames render failed: stale running job recovered",
      failedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
    },
  });

  console.log(`[OK] recovered ${result.count} stale running jobs`);
}

main().catch((error: unknown) => {
  console.error(`[FAIL] ${error instanceof Error ? error.message : "stale recovery failed"}`);
  process.exit(1);
});
