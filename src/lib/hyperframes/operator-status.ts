import { RenderJobStatus } from "@prisma/client";
import { statfsSync } from "node:fs";
import { execSync } from "node:child_process";

import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

export type HyperFramesOperatorStatus = {
  pending: number;
  running: number;
  completedLast24h: number;
  failedLast24h: number;
  oldestPendingCreatedAt: string | null;
  oldestRunningStartedAt: string | null;
  staleRunning: number;
  renderEnabled: boolean;
  maxPendingJobs: number;
  maxRunningJobs: number;
  diskFreeMb: number | null;
  serviceActive: boolean | null;
  serviceEnabled: boolean | null;
};

export function isOperatorStatusEnabled(): boolean {
  return process.env.HYPERFRAMES_OPERATOR_STATUS_ENABLED === "true";
}

function getDiskFreeMb(pathname: string): number | null {
  try { const s = statfsSync(pathname); return Math.floor((Number(s.bavail) * Number(s.bsize)) / (1024 * 1024)); } catch { return null; }
}

function getSystemdState(cmd: string): boolean | null {
  try { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() === "active" || execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() === "enabled"; } catch { return null; }
}

export async function getHyperFramesOperatorStatus(): Promise<HyperFramesOperatorStatus> {
  const config = getHyperFramesRenderConfig();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const staleSince = new Date(Date.now() - config.runningStaleMinutes * 60 * 1000);
  const [pending, running, completedLast24h, failedLast24h, oldestPending, oldestRunning, staleRunning] = await Promise.all([
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.COMPLETED, completedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.FAILED, failedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.PENDING, deletedAt: null }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.RUNNING, deletedAt: null }, orderBy: { startedAt: "asc" }, select: { startedAt: true } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null, startedAt: { lt: staleSince } } }),
  ]);

  return {
    pending, running, completedLast24h, failedLast24h,
    oldestPendingCreatedAt: oldestPending?.createdAt?.toISOString() ?? null,
    oldestRunningStartedAt: oldestRunning?.startedAt?.toISOString() ?? null,
    staleRunning,
    renderEnabled: config.enabled,
    maxPendingJobs: config.maxPendingJobs,
    maxRunningJobs: config.maxRunningJobs,
    diskFreeMb: getDiskFreeMb(config.outputDir),
    serviceActive: getSystemdState("systemctl is-active zsp-hyperframes-worker"),
    serviceEnabled: getSystemdState("systemctl is-enabled zsp-hyperframes-worker"),
  };
}
