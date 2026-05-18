import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { assertArtifactInsideOutputDir } from "@/lib/hyperframes/artifact-access";

export type RenderInventorySummary = {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  missingArtifactCount: number;
  orphanArtifactCount: number;
  totalArtifactBytes: number;
  repairedJobs: number;
  repairEnabled: boolean;
};

type RenderJobRecord = {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  outputPath: string | null;
};

async function walkArtifacts(dir: string): Promise<Map<string, number>> {
  const artifacts = new Map<string, number>();
  const stack = [path.resolve(dir)];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const fileStat = await stat(fullPath);
      artifacts.set(path.resolve(fullPath), fileStat.size);
    }
  }

  return artifacts;
}

export async function runRenderInventory(): Promise<RenderInventorySummary> {
  const config = getHyperFramesRenderConfig();
  const repairEnabled = process.env.HYPERFRAMES_INVENTORY_REPAIR === "true";
  const outputDir = path.resolve(config.outputDir);

  const [jobs, artifacts] = await Promise.all([
    prisma.hyperFrameRenderJob.findMany({
      where: { deletedAt: null },
      select: { id: true, status: true, outputPath: true },
    }) as Promise<RenderJobRecord[]>,
    walkArtifacts(outputDir),
  ]);

  let completedJobs = 0;
  let failedJobs = 0;
  let missingArtifactCount = 0;
  let repairedJobs = 0;

  const linkedArtifacts = new Set<string>();

  for (const job of jobs) {
    if (job.status === "COMPLETED") completedJobs += 1;
    if (job.status === "FAILED") failedJobs += 1;

    if (!job.outputPath) continue;

    const resolvedOutputPath = path.resolve(job.outputPath);
    assertArtifactInsideOutputDir(outputDir, resolvedOutputPath);
    linkedArtifacts.add(resolvedOutputPath);

    if (job.status === "COMPLETED" && !artifacts.has(resolvedOutputPath)) {
      missingArtifactCount += 1;
      if (repairEnabled) {
        await prisma.hyperFrameRenderJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            errorMessage: "ARTIFACT_MISSING",
            failedAt: new Date(),
            completedAt: null,
            outputUrl: null,
          },
        });
        repairedJobs += 1;
      }
    }
  }

  let orphanArtifactCount = 0;
  let totalArtifactBytes = 0;

  for (const [artifactPath, bytes] of artifacts.entries()) {
    totalArtifactBytes += bytes;
    if (!linkedArtifacts.has(artifactPath)) orphanArtifactCount += 1;
  }

  return {
    totalJobs: jobs.length,
    completedJobs,
    failedJobs,
    missingArtifactCount,
    orphanArtifactCount,
    totalArtifactBytes,
    repairedJobs,
    repairEnabled,
  };
}

export async function main(): Promise<void> {
  const summary = await runRenderInventory();
  console.log(JSON.stringify(summary, null, 2));
}

const isDirectRun = process.argv[1] ? path.resolve(process.argv[1]) === path.resolve(__filename) : false;

if (isDirectRun) {
  main().catch((error: unknown) => {
    console.error(`[FAIL] ${error instanceof Error ? error.message : "render inventory failed"}`);
    process.exit(1);
  });
}
