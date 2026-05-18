import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { RenderJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { ensureOutputWithinDir } from "@/lib/hyperframes/render-safety";

const execFileAsync = promisify(execFile);

async function claim(workerId: string) {
  const pending = await prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.PENDING, deletedAt: null }, orderBy: { createdAt: "asc" } });
  if (!pending) return null;
  const result = await prisma.hyperFrameRenderJob.updateMany({ where: { id: pending.id, status: RenderJobStatus.PENDING, lockedAt: null }, data: { lockedAt: new Date(), lockedBy: workerId, status: RenderJobStatus.RUNNING, startedAt: new Date(), attempts: { increment: 1 } } });
  if (result.count === 0) return null;
  return prisma.hyperFrameRenderJob.findUnique({ where: { id: pending.id } });
}

function cliCommand(config: ReturnType<typeof getHyperFramesRenderConfig>, args: string[]): { file: string; args: string[] } {
  return { file: config.cliBin, args: [...config.cliArgs, ...args] };
}

async function main() {
  const config = getHyperFramesRenderConfig();
  if (!config.enabled) { console.log(JSON.stringify({ level: "info", message: "render disabled" })); return; }
  await mkdir(config.workDir, { recursive: true });
  await mkdir(config.outputDir, { recursive: true });
  await execFileAsync(config.nodeBin, ["--version"]);
  await execFileAsync(config.ffmpegBin, ["-version"]);
  const helpCmd = cliCommand(config, ["--help"]);
  await execFileAsync(helpCmd.file, helpCmd.args);
  const workerId = `worker-${process.pid}`;
  const job = await claim(workerId);
  if (!job) return;
  const jobDir = `${config.workDir}/${job.id}`;
  try {
    await mkdir(jobDir, { recursive: true });
    const htmlPath = `${jobDir}/composition.html`;
    const outputPath = ensureOutputWithinDir(config.outputDir, `${job.id}.mp4`);
    await writeFile(htmlPath, job.compositionHtml, "utf8");
    const renderCmd = cliCommand(config, ["render", "--input", htmlPath, "--output", outputPath, "--duration", String(config.maxDurationSeconds)]);
    await execFileAsync(renderCmd.file, renderCmd.args);
    await prisma.hyperFrameRenderJob.update({ where: { id: job.id }, data: { status: RenderJobStatus.COMPLETED, outputPath, completedAt: new Date(), lockedAt: null, lockedBy: null } });
  } catch (error) {
    await prisma.hyperFrameRenderJob.update({ where: { id: job.id }, data: { status: RenderJobStatus.FAILED, errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Render failed", failedAt: new Date(), lockedAt: null, lockedBy: null } });
  } finally { await rm(jobDir, { recursive: true, force: true }); }
}

main().catch((error) => { console.error(error); process.exit(1); });
