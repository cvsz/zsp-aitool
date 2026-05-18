import { opendir, realpath, rm, stat } from "node:fs/promises";
import path from "node:path";
import { RenderJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

async function main(): Promise<void> {
  const config = getHyperFramesRenderConfig();
  const root = await realpath(config.outputDir);
  const threshold = Date.now() - config.retentionDays * 24 * 3600 * 1000;
  const runningOutputs = new Set((await prisma.hyperFrameRenderJob.findMany({ where: { status: RenderJobStatus.RUNNING, deletedAt: null }, select: { outputPath: true } })).map((x) => x.outputPath).filter(Boolean));
  let files = 0; let bytes = 0;
  for await (const dirent of await opendir(root)) {
    if (!dirent.isFile()) continue;
    const candidate = path.join(root, dirent.name);
    const real = await realpath(candidate);
    if (!real.startsWith(root + path.sep)) { console.log(`[FAIL] path escape blocked: ${candidate}`); continue; }
    if (runningOutputs.has(real)) { console.log(`[SKIP] active running output: ${dirent.name}`); continue; }
    const st = await stat(real);
    if (st.mtimeMs > threshold) continue;
    files += 1; bytes += st.size;
    if (!config.cleanupDryRun) await rm(real, { force: true });
  }
  console.log(`[OK] eligibleFiles=${files} eligibleBytes=${bytes}`);
  if (config.cleanupDryRun) console.log("[WARN] dry-run mode enabled; set HYPERFRAMES_CLEANUP_DRY_RUN=false to delete");
}

main().catch((error: unknown) => { console.error(`[FAIL] ${error instanceof Error ? error.message : "cleanup failed"}`); process.exit(1); });
