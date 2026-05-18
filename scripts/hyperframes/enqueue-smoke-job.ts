import { RenderJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

export async function enqueueSmokeJob(): Promise<{ jobId: string; status: RenderJobStatus }> {
  const config = getHyperFramesRenderConfig();
  if (!config.enabled) {
    throw new Error("HYPERFRAMES_RENDER_ENABLED must be true");
  }
  if (process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM !== "YES") {
    throw new Error("HYPERFRAMES_RENDER_SMOKE_CONFIRM must be YES");
  }

  const userId = process.env.HYPERFRAMES_SMOKE_USER_ID?.trim();
  if (!userId) {
    throw new Error("HYPERFRAMES_SMOKE_USER_ID is required");
  }

  const pendingCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } });
  if (pendingCount >= config.maxPendingJobs) {
    throw new Error(`[SKIP] pending queue limit reached (${pendingCount}/${config.maxPendingJobs})`);
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw new Error("HYPERFRAMES_SMOKE_USER_ID does not exist");
  }

  const durationSeconds = Math.min(config.maxDurationSeconds, 6);
  const composition = buildHyperFrameComposition({
    productId: "smoke-product",
    platform: "facebook",
    aspectRatio: "16:9",
    durationSeconds,
    caption: "ทดสอบ lifecycle ของงานเรนเดอร์ HyperFrames",
    product: {
      title: "สินค้าเดโม่สำหรับงาน smoke",
      price: "199",
      currency: "THB",
      affiliateUrl: "https://example.com/aff/smoke",
      imageUrl: undefined,
    },
  });

  const created = await prisma.hyperFrameRenderJob.create({
    data: {
      userId: user.id,
      status: RenderJobStatus.PENDING,
      compositionHtml: composition.compositionHtml,
      compositionMetadata: {
        ...composition.metadata,
        source: "smoke",
        createdBy: "hyperframes:enqueue-smoke-job",
      },
    },
    select: { id: true, status: true },
  });

  return { jobId: created.id, status: RenderJobStatus.PENDING };
}

if (require.main === module) {
  enqueueSmokeJob()
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result)}\n`);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "failed to enqueue smoke job";
      console.error(message);
      process.exit(1);
    });
}
