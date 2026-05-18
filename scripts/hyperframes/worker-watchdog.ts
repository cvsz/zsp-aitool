import { access, constants } from "node:fs/promises";
import { statfsSync } from "node:fs";
import { execSync } from "node:child_process";
import { RenderJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

export async function runWatchdog(): Promise<number> {
  const c = getHyperFramesRenderConfig();
  const msgs: string[] = [];
  let hasFail = false;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const staleSince = new Date(Date.now() - c.watchdogStaleRunningMinutes * 60 * 1000);
  const [pending, running, completedLast24h, failedLast24h, oldestPending, oldestRunning, staleRunning] = await Promise.all([
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.COMPLETED, completedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.FAILED, failedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.PENDING, deletedAt: null }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.RUNNING, deletedAt: null }, orderBy: { startedAt: "asc" }, select: { startedAt: true } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null, startedAt: { lt: staleSince } } }),
  ]);
  const serviceActive = (()=>{try{return execSync('systemctl is-active zsp-hyperframes-worker',{encoding:'utf8'}).trim()==='active';}catch{return null;}})();
  const serviceEnabled = (()=>{try{return execSync('systemctl is-enabled zsp-hyperframes-worker',{encoding:'utf8'}).trim()==='enabled';}catch{return null;}})();
  let freeDiskMb: number | null = null;
  try { const s=statfsSync(c.outputDir); freeDiskMb=Math.floor((Number(s.bavail)*Number(s.bsize))/1048576);} catch {}
  let outputWritable=true; try { await access(c.outputDir, constants.W_OK);} catch { outputWritable=false; }

  const line=(lvl:string,m:string)=>{msgs.push(`[${lvl}] ${m}`); if(lvl==='FAIL') hasFail=true;};
  if (!c.enabled) {
    line('SKIP','HyperFrames render disabled');
    if (serviceEnabled) line('WARN','service enabled while render disabled');
    if (serviceActive) line('WARN','service active while render disabled');
  } else if (c.watchdogRequireServiceActive && serviceActive === false) line('FAIL','service not active');
  if (!outputWritable) line('FAIL','output dir not writable');
  if (freeDiskMb !== null && freeDiskMb < c.watchdogMinFreeMb) line('FAIL',`free disk low (${freeDiskMb}MB)`);
  if (failedLast24h > c.watchdogMaxFailedLast24h) line('WARN',`failedLast24h high (${failedLast24h})`);
  if (pending > c.watchdogMaxPendingJobs) line('WARN',`pending high (${pending})`);
  if (running > c.maxRunningJobs) line('FAIL',`running above max (${running})`);
  if (staleRunning > 0) line('WARN',`stale running jobs detected (${staleRunning})`);

  if (staleRunning > 0 && c.watchdogRecoverStale && process.env.HYPERFRAMES_WATCHDOG_CONFIRM === 'YES') {
    line('WARN', 'stale recovery explicitly enabled; operator should run npm run hyperframes:recover-stale-jobs');
  }

  for (const m of msgs) console.log(m);
  console.log(JSON.stringify({ pending, running, completedLast24h, failedLast24h, oldestPendingCreatedAt: oldestPending?.createdAt?.toISOString() ?? null, oldestRunningStartedAt: oldestRunning?.startedAt?.toISOString() ?? null, staleRunning, renderEnabled: c.enabled, serviceActive, serviceEnabled, freeDiskMb }, null, 2));
  return hasFail ? 1 : 0;
}

if (require.main === module) runWatchdog().then((code)=>process.exit(code)).catch((e)=>{console.error(`[FAIL] ${e instanceof Error ? e.message : 'watchdog failed'}`);process.exit(1);});
