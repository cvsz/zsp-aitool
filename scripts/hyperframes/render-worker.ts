import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { RenderJobStatus, type HyperFrameRenderJob } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { execSync } from "node:child_process";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { ensureOutputWithinDir } from "@/lib/hyperframes/render-safety";
import { buildHyperFramesCommand, renderCommandToDisplayString } from "@/lib/hyperframes/render-command";
import { validateRenderArtifact } from "@/lib/hyperframes/render-validation";

const execFileAsync = promisify(execFile);

type RenderCommandRunner = (bin: string, args: string[]) => Promise<void>;

type ProcessOnePendingJobOptions = {
  runRenderCommand?: RenderCommandRunner;
  now?: () => Date;
  workerId?: string;
};

function getFreeMb(targetPath: string): number {
  const out = execSync(`df -Pk ${JSON.stringify(targetPath)}`, { encoding: "utf8" }).trim();
  const lines = out.split("\n").filter(Boolean);
  const row = lines.at(-1) ?? "";
  const cols = row.trim().split(/\s+/);
  const singleValueMode = cols.length === 1;
  const availableRaw = cols.length >= 4 ? cols[3] : cols.at(-1);
  const available = Number.parseInt(availableRaw ?? "", 10);
  if (!Number.isFinite(available) || available <= 0) {
    throw new Error("disk free check failed");
  }
  return singleValueMode ? available : Math.floor(available / 1024);
}

async function claim(workerId: string, config: ReturnType<typeof getHyperFramesRenderConfig>): Promise<HyperFrameRenderJob | null> {
  const runningCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null } });
  if (runningCount >= config.maxRunningJobs) return null;

  const pending = await prisma.hyperFrameRenderJob.findFirst({
    where: { status: RenderJobStatus.PENDING, deletedAt: null, attempts: { lt: config.maxAttempts } },
    orderBy: { createdAt: "asc" }
  });
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
  const workerId = options.workerId ?? process.env.HYPERFRAMES_WORKER_ID ?? `${process.env.HOSTNAME ?? "host"}-${process.pid}`;
  const config = getHyperFramesRenderConfig();
  const job = await claim(workerId, config);
  if (!job) return false;

  const jobDir = path.join(config.workDir, job.id);
  try {
    await mkdir(jobDir, { recursive: true });
    const htmlPath = path.join(jobDir, "index.html");
    const metaPath = path.join(jobDir, "meta.json");
    const projectConfigPath = path.join(jobDir, "hyperframes.json");
    const rendersDir = path.join(jobDir, "renders");
    const outputPath = ensureOutputWithinDir(config.outputDir, `${job.id}.mp4`);
    await writeFile(htmlPath, job.compositionHtml, "utf8");
    await writeFile(metaPath, JSON.stringify({ title: `HyperFrames Job ${job.id}`, duration: config.maxDurationSeconds }), "utf8");
    await writeFile(projectConfigPath, JSON.stringify({}), "utf8");
    await mkdir(rendersDir, { recursive: true });
    await mkdir(config.outputDir, { recursive: true });
    const freeMb = getFreeMb(config.outputDir);
    if (freeMb < config.minFreeMb) throw new Error(`insufficient disk space: free=${freeMb}MB required=${config.minFreeMb}MB`);
    const renderCmd = buildHyperFramesCommand(["render", "--input", jobDir, "--output", outputPath, "--duration", String(config.maxDurationSeconds)], config);
    console.log(`[OK] running render command: ${renderCommandToDisplayString(renderCmd)}`);
    await runRenderCommand(renderCmd.bin, renderCmd.args);
    await validateRenderArtifact(outputPath, { minBytes: 1024, maxOutputMb: config.maxOutputMb, maxDurationSeconds: config.maxDurationSeconds, ffprobeBin: process.env.HYPERFRAMES_FFPROBE_BIN ?? "ffprobe" });
    await prisma.hyperFrameRenderJob.update({ where: { id: job.id }, data: { status: RenderJobStatus.COMPLETED, outputPath, outputUrl: null, completedAt: now(), errorMessage: null, failedAt: null, lockedAt: null, lockedBy: null } });
  } catch (error) {
    await prisma.hyperFrameRenderJob.update({ where: { id: job.id }, data: { status: RenderJobStatus.FAILED, errorMessage: toControlledErrorMessage(error), failedAt: now(), lockedAt: null, lockedBy: null } });
  } finally {
    await rm(jobDir, { recursive: true, force: true });
  }

  return true;
}

export async function runWorker(argv: string[]): Promise<void> {
  const once = argv.includes("--once");
  const workerId = process.env.HYPERFRAMES_WORKER_ID ?? `${process.env.HOSTNAME ?? "host"}-${process.pid}`;
  const config = getHyperFramesRenderConfig();
  console.log(JSON.stringify({ level: "info", event: "worker.start", workerId, once }));
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
    await processOnePendingJob({ workerId });
    return;
  }

  while (true) {
    const processed = await processOnePendingJob({ workerId });
    if (!processed) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}

if (require.main === module) {
  runWorker(process.argv.slice(2)).catch((error) => {
    const message = toControlledErrorMessage(error);
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  });
}
