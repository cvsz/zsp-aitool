import { RenderJobStatus } from "@prisma/client";
import { statfsSync } from "node:fs";

import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

export type HyperFramesOperatorStatus = {
  pending: number;
  running: number;
  completedLast24h: number;
  failedLast24h: number;
  oldestPendingCreatedAt: string | null;
  renderEnabled: boolean;
  maxPendingJobs: number;
  maxRunningJobs: number;
  diskFreeMb: number | null;
};

export function isOperatorStatusEnabled(): boolean {
  return process.env.HYPERFRAMES_OPERATOR_STATUS_ENABLED === "true";
}

function getDiskFreeMb(pathname: string): number | null {
  try {
    const stats = statfsSync(pathname);
    const freeBytes = Number(stats.bavail) * Number(stats.bsize);
    return Math.floor(freeBytes / (1024 * 1024));
  } catch {
    return null;
  }
}

export async function getHyperFramesOperatorStatus(): Promise<HyperFramesOperatorStatus> {
  const config = getHyperFramesRenderConfig();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [pending, running, completedLast24h, failedLast24h, oldestPending] = await Promise.all([
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.COMPLETED, completedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.FAILED, failedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.findFirst({ where: { status: RenderJobStatus.PENDING, deletedAt: null }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);

  return {
    pending,
    running,
    completedLast24h,
    failedLast24h,
    oldestPendingCreatedAt: oldestPending?.createdAt?.toISOString() ?? null,
    renderEnabled: config.enabled,
    maxPendingJobs: config.maxPendingJobs,
    maxRunningJobs: config.maxRunningJobs,
    diskFreeMb: getDiskFreeMb(config.outputDir),
  };
}
