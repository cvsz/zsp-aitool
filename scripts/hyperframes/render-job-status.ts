import { prisma } from "@/lib/prisma";

export async function getRenderJobStatus(jobId: string): Promise<Record<string, unknown>> {
  if (!jobId.trim()) {
    throw new Error("job id argument is required");
  }

  const job = await prisma.hyperFrameRenderJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      attempts: true,
      outputPath: true,
      outputUrl: true,
      errorMessage: true,
      completedAt: true,
      failedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!job) {
    throw new Error("job not found");
  }

  return job;
}

if (require.main === module) {
  const jobId = process.argv[2] ?? "";
  getRenderJobStatus(jobId)
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result)}\n`);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "failed to read render job status";
      console.error(message);
      process.exit(1);
    });
}
