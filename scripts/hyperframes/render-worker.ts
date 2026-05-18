import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { RenderJobStatus, type HyperFrameRenderJob } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { ensureOutputWithinDir } from "@/lib/hyperframes/render-safety";
import { buildHyperFramesCommand } from "@/lib/hyperframes/render-command";

const execFileAsync = promisify(execFile);

type RenderCommandRunner = (bin: string, args: string[]) => Promise<void>;

type ProcessOnePendingJobOptions = {
  runRenderCommand?: RenderCommandRunner;
  now?: () => Date;
  workerId?: string;
};

async function claim(workerId: string): Promise<HyperFrameRenderJob | null> {
  const pending = await prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.PENDING, deletedAt: null }, orderBy: { createdAt: "asc" } });
  if (!pending) return null;
  const result = await prisma.hyperFrameRenderJob.updateMany({ where: { id: pending.id, status: RenderJobStatus.PENDING, lockedAt: null }, data: { lockedAt: new Date(), lockedBy: workerId, status: RenderJobStatus.RUNNING, startedAt: new Date(), attempts: { increment: 1 } } });
  if (result.count === 0) return null;
  return prisma.hyperFrameRenderJob.findUnique({ where: { id: pending.id } });
}

function toControlledErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const safe = error.message.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
    return `HyperFrames render failed: ${safe}`.slice(0, 500);
  }
  return "HyperFrames render failed";
}

export async function processOnePendingJob(options: ProcessOnePendingJobOptions = {}): Promise<boolean> {
  const runRenderCommand = options.runRenderCommand ?? ((bin, args) => execFileAsync(bin, args).then(() => undefined));
  const now = options.now ?? (() => new Date());
  const workerId = options.workerId ?? `worker-${process.pid}`;
  const config = getHyperFramesRenderConfig();
  const job = await claim(workerId);
  if (!job) return false;

  const jobDir = `${config.workDir}/${job.id}`;
  try {
    await mkdir(jobDir, { recursive: true });
    const htmlPath = `${jobDir}/composition.html`;
    const outputPath = ensureOutputWithinDir(config.outputDir, `${job.id}.mp4`);
    await writeFile(htmlPath, job.compositionHtml, "utf8");
    const renderCmd = buildHyperFramesCommand(["render", "--input", htmlPath, "--output", outputPath, "--duration", String(config.maxDurationSeconds)], config);
    await runRenderCommand(renderCmd.bin, renderCmd.args);
    await prisma.hyperFrameRenderJob.update({ where: { id: job.id }, data: { status: RenderJobStatus.COMPLETED, outputPath, outputUrl: null, completedAt: now(), lockedAt: null, lockedBy: null } });
  } catch (error) {
    await prisma.hyperFrameRenderJob.update({ where: { id: job.id }, data: { status: RenderJobStatus.FAILED, errorMessage: toControlledErrorMessage(error), failedAt: now(), lockedAt: null, lockedBy: null } });
  } finally {
    await rm(jobDir, { recursive: true, force: true });
  }

  return true;
}

export async function runWorker(argv: string[]): Promise<void> {
  const once = argv.includes("--once");
  const config = getHyperFramesRenderConfig();
  if (!config.enabled) {
    console.log(JSON.stringify({ level: "info", message: "render disabled" }));
    return;
  }

  await mkdir(config.workDir, { recursive: true });
  await mkdir(config.outputDir, { recursive: true });
  await execFileAsync(config.nodeBin, ["--version"]);
  await execFileAsync(config.ffmpegBin, ["-version"]);
  const helpCmd = buildHyperFramesCommand(["--help"], config);
  await execFileAsync(helpCmd.bin, helpCmd.args);

  if (once) {
    await processOnePendingJob();
    return;
  }

  while (true) {
    const processed = await processOnePendingJob();
    if (!processed) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}

if (require.main === module) {
  runWorker(process.argv.slice(2)).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
