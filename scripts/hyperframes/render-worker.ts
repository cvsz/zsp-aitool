import { execFile } from "node:child_process";
import { statfsSync } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { Prisma, RenderJobStatus, type HyperFrameRenderJob } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { ensureOutputWithinDir } from "@/lib/hyperframes/render-safety";
import { buildHyperFramesCommand, renderCommandToDisplayString } from "@/lib/hyperframes/render-command";
import { validateRenderArtifact } from "@/lib/hyperframes/render-validation";
import { fetchAndCacheHyperframesAsset } from "@/lib/hyperframes/asset-fetch";
import { resolveRenderQuality, type HyperFramesQualityProfile } from "@/lib/hyperframes/render-quality";

const execFileAsync = promisify(execFile);

type RenderCommandRunner = (bin: string, args: string[]) => Promise<void>;
type MaybeExtractThumbnail = (opts: { ffmpegBin: string; outputPath: string; thumbnailPath: string }) => Promise<boolean>;

type ProcessOnePendingJobOptions = { runRenderCommand?: RenderCommandRunner; maybeExtractThumbnail?: MaybeExtractThumbnail; now?: () => Date; workerId?: string };

function getFreeMb(targetPath: string): number {
  const stats = statfsSync(targetPath);
  const freeBytes = Number(stats.bavail) * Number(stats.bsize);
  if (!Number.isFinite(freeBytes) || freeBytes <= 0) {
    throw new Error("disk free check failed");
  }
  return Math.floor(freeBytes / 1048576);
}

async function claim(workerId: string, config: ReturnType<typeof getHyperFramesRenderConfig>): Promise<HyperFrameRenderJob | null> {
  const runningCount = await prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null } });
  if (runningCount >= config.maxRunningJobs) return null;
  const pending = await prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.PENDING, deletedAt: null, attempts: { lt: config.maxAttempts } }, orderBy: { createdAt: "asc" } });
  if (!pending) return null;
  const result = await prisma.hyperFrameRenderJob.updateMany({ where: { id: pending.id, status: RenderJobStatus.PENDING, lockedAt: null }, data: { lockedAt: new Date(), lockedBy: workerId, status: RenderJobStatus.RUNNING, startedAt: new Date(), attempts: { increment: 1 } } });
  if (result.count === 0) return null;
  return prisma.hyperFrameRenderJob.findUnique({ where: { id: pending.id } });
}

async function maybeExtractThumbnailFromVideo({ ffmpegBin, outputPath, thumbnailPath }: { ffmpegBin: string; outputPath: string; thumbnailPath: string }): Promise<boolean> {
  try {
    await execFileAsync(ffmpegBin, ["-y", "-ss", "00:00:01", "-i", outputPath, "-frames:v", "1", "-q:v", "3", thumbnailPath]);
    const thumbStat = await stat(thumbnailPath);
    return thumbStat.size > 0;
  } catch { return false; }
}

async function cacheCompositionAssets(compositionHtml: string, cacheDir: string, jobDir: string): Promise<string> {
  const srcRegex = /(<(?:img|source|video)\b[^>]*\bsrc=")([^"]+)("[^>]*>)/gi;
  const matches = Array.from(compositionHtml.matchAll(srcRegex));
  let output = compositionHtml;
  for (const match of matches) {
    const raw = match[2] ?? "";
    if (!raw.startsWith("http://") && !raw.startsWith("https://")) continue;
    const localPath = await fetchAndCacheHyperframesAsset(raw, cacheDir, 25 * 1024 * 1024);
    const rel = path.relative(jobDir, localPath).replaceAll(path.sep, "/");
    output = output.replace(raw, rel);
  }
  return output;
}

function toControlledErrorMessage(error: unknown): string {
  if (error instanceof Error) return `HyperFrames render failed: ${error.message.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim()}`.slice(0, 500);
  return "HyperFrames render failed";
}

function getRequestedQualityProfile(job: HyperFrameRenderJob): HyperFramesQualityProfile | undefined {
  const metadata = job.compositionMetadata;
  if (!metadata || typeof metadata !== "object") return undefined;
  const value = (metadata as { qualityProfile?: unknown }).qualityProfile;
  return value === "preview" || value === "standard" || value === "high" ? value : undefined;
}

export async function processOnePendingJob(options: ProcessOnePendingJobOptions = {}): Promise<boolean> {
  const runRenderCommand = options.runRenderCommand ?? ((bin, args) => execFileAsync(bin, args).then(() => undefined));
  const now = options.now ?? (() => new Date());
  const maybeExtractThumbnail = options.maybeExtractThumbnail ?? maybeExtractThumbnailFromVideo;
  const workerId = options.workerId ?? process.env.HYPERFRAMES_WORKER_ID ?? `${process.env.HOSTNAME ?? "host"}-${process.pid}`;
  const config = getHyperFramesRenderConfig();
  const job = await claim(workerId, config);
  if (!job) return false;

  const jobDir = path.join(config.workDir, job.id);
  try {
    await mkdir(jobDir, { recursive: true });
    await mkdir(config.outputDir, { recursive: true });
    const cacheDir = path.join(jobDir, "assets");
    await mkdir(cacheDir, { recursive: true });
    const htmlPath = path.join(jobDir, "index.html");
    const metaPath = path.join(jobDir, "hyperframes.json");
    const projectConfigPath = path.join(jobDir, "package.json");
    const outputPath = ensureOutputWithinDir(config.outputDir, `${job.id}.mp4`);
    const thumbnailName = `${job.id}.jpg`;
    const thumbnailPath = ensureOutputWithinDir(config.outputDir, thumbnailName);
    const requestedProfile = getRequestedQualityProfile(job);
    const quality = resolveRenderQuality(requestedProfile, { allowedRaw: config.allowedQualityProfiles, highQualityEnabled: config.highQualityEnabled });

    const cachedHtml = await cacheCompositionAssets(job.compositionHtml, cacheDir, jobDir);
    await writeFile(htmlPath, cachedHtml, "utf8");
    await writeFile(metaPath, JSON.stringify({ title: `HyperFrames Job ${job.id}`, duration: quality.spec.durationSeconds, qualityProfile: quality.profile }), "utf8");
    await writeFile(projectConfigPath, JSON.stringify({}), "utf8");
    const freeMb = getFreeMb(config.outputDir);
    if (freeMb < config.minFreeMb) throw new Error(`insufficient disk space: free=${freeMb}MB required=${config.minFreeMb}MB`);

    const renderCmd = buildHyperFramesCommand(["render", "--input", jobDir, "--output", outputPath, "--duration", String(quality.spec.durationSeconds), ...quality.spec.cliArgs], config);
    console.log(`[OK] running render command: ${renderCommandToDisplayString(renderCmd)}`);
    await runRenderCommand(renderCmd.bin, renderCmd.args);
    await validateRenderArtifact(outputPath, { minBytes: 1024, maxOutputMb: Math.min(config.maxOutputMb, quality.spec.maxOutputMb), maxDurationSeconds: quality.spec.durationSeconds, ffprobeBin: process.env.HYPERFRAMES_FFPROBE_BIN ?? "ffprobe" });
    const renderedStat = await stat(outputPath);
    const thumbnailCreated = await maybeExtractThumbnail({ ffmpegBin: config.ffmpegBin, outputPath, thumbnailPath });
    const currentMetadata = job.compositionMetadata && typeof job.compositionMetadata === "object" && !Array.isArray(job.compositionMetadata) ? (job.compositionMetadata as Record<string, unknown>) : {};
    const compositionMetadata: Prisma.InputJsonValue = (thumbnailCreated ? { ...currentMetadata, thumbnailName } : currentMetadata) as Prisma.InputJsonValue;
    await prisma.hyperFrameRenderJob.update({ where: { id: job.id }, data: { status: RenderJobStatus.COMPLETED, outputPath, outputUrl: null, outputSizeBytes: BigInt(renderedStat.size), compositionMetadata, completedAt: now(), errorMessage: null, failedAt: null, lockedAt: null, lockedBy: null } });
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
  if (!config.enabled) { console.log(JSON.stringify({ level: "info", message: "render disabled" })); return; }
  await mkdir(config.workDir, { recursive: true });
  await mkdir(config.outputDir, { recursive: true });
  await execFileAsync(config.nodeBin, ["--version"]);
  await execFileAsync(config.ffmpegBin, ["-version"]);
  const helpCmd = buildHyperFramesCommand(["--help"], config);
  await execFileAsync(helpCmd.bin, helpCmd.args);
  if (once) { await processOnePendingJob({ workerId }); return; }
  while (true) {
    const processed = await processOnePendingJob({ workerId });
    if (!processed) await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

if (require.main === module) {
  runWorker(process.argv.slice(2)).catch((error) => { console.error(`[FAIL] ${toControlledErrorMessage(error)}`); process.exit(1); });
}
