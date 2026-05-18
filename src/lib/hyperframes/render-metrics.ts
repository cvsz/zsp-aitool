import { RenderJobStatus } from "@prisma/client";
import { statfsSync } from "node:fs";
import { execSync } from "node:child_process";

import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

export type HyperFramesRenderMetrics = {
  pending: number;
  running: number;
  completedTotal: number;
  failedTotal: number;
  completedLast24h: number;
  failedLast24h: number;
  diskFreeMb: number | null;
  serviceActive: boolean | null;
};

export function isRenderMetricsEnabled(): boolean {
  return process.env.HYPERFRAMES_METRICS_ENABLED === "true";
}

export function hasRenderMetricsAccess(input: { email?: string | null; internalToken?: string | null }): boolean {
  const internalToken = process.env.HYPERFRAMES_INTERNAL_TOKEN;
  if (internalToken && input.internalToken && input.internalToken === internalToken) {
    return true;
  }

  const email = (input.email ?? "").trim().toLowerCase();
  if (!email) return false;

  const allowlist = (process.env.HYPERFRAMES_OPERATOR_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(email);
}

function getDiskFreeMb(pathname: string): number | null {
  try {
    const stats = statfsSync(pathname);
    return Math.floor((Number(stats.bavail) * Number(stats.bsize)) / (1024 * 1024));
  } catch {
    return null;
  }
}

function getServiceActive(): boolean | null {
  try {
    return execSync("systemctl is-active zsp-hyperframes-worker", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() === "active";
  } catch {
    return null;
  }
}

export async function getRenderMetrics(): Promise<HyperFramesRenderMetrics> {
  const config = getHyperFramesRenderConfig();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [pending, running, completedTotal, failedTotal, completedLast24h, failedLast24h] = await Promise.all([
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.PENDING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.RUNNING, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.COMPLETED, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.FAILED, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.COMPLETED, completedAt: { gte: since }, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { status: RenderJobStatus.FAILED, failedAt: { gte: since }, deletedAt: null } }),
  ]);

  return {
    pending,
    running,
    completedTotal,
    failedTotal,
    completedLast24h,
    failedLast24h,
    diskFreeMb: getDiskFreeMb(config.outputDir),
    serviceActive: getServiceActive(),
  };
}
