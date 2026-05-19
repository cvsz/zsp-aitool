import { execSync } from "node:child_process";
import { statfsSync } from "node:fs";
import { RenderJobStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

export type HyperFramesRenderMetrics = {
  pending: number;
  running: number;
  completedTotal: number;
  failedTotal: number;
  completedLast24h: number;
  failedLast24h: number;
  freeDiskMb: number | null;
  diskFreeMb: number | null;
  serviceActive: boolean | null;
};

export function isHyperFramesMetricsEnabled(): boolean {
  return process.env.HYPERFRAMES_METRICS_ENABLED === "true";
}
export const isRenderMetricsEnabled = isHyperFramesMetricsEnabled;

export function hasRenderMetricsAccess(input: { email?: string | null; internalToken?: string | null }): boolean {
  const expected = process.env.HYPERFRAMES_INTERNAL_TOKEN;
  if (expected && input.internalToken === expected) return true;
  const email = (input.email ?? "").trim().toLowerCase();
  if (!email) return false;
  return (process.env.HYPERFRAMES_OPERATOR_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).includes(email);
}

function getDiskFreeMb(pathname: string): number | null {
  try {
    const stats = statfsSync(pathname);
    return Math.floor((Number(stats.bavail) * Number(stats.bsize)) / (1024 * 1024));
  } catch { return null; }
}

function getServiceActive(): boolean | null {
  try { return execSync("systemctl is-active zsp-hyperframes-worker", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() === "active"; }
  catch { return null; }
}

export async function getHyperFramesRenderMetrics(): Promise<HyperFramesRenderMetrics> {
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
  const diskFreeMb = getDiskFreeMb(config.outputDir);
  return { pending, running, completedTotal, failedTotal, completedLast24h, failedLast24h, freeDiskMb: diskFreeMb, diskFreeMb, serviceActive: getServiceActive() };
}
export const getRenderMetrics = getHyperFramesRenderMetrics;

export function toPrometheusMetrics(metrics: HyperFramesRenderMetrics): string {
  const serviceActive = metrics.serviceActive == null ? -1 : metrics.serviceActive ? 1 : 0;
  return [
    "# HELP hyperframes_pending_jobs Current number of pending HyperFrames jobs",
    "# TYPE hyperframes_pending_jobs gauge",
    `hyperframes_pending_jobs ${metrics.pending}`,
    "# HELP hyperframes_running_jobs Current number of running HyperFrames jobs",
    "# TYPE hyperframes_running_jobs gauge",
    `hyperframes_running_jobs ${metrics.running}`,
    "# HELP hyperframes_completed_total Total completed HyperFrames jobs",
    "# TYPE hyperframes_completed_total counter",
    `hyperframes_completed_total ${metrics.completedTotal}`,
    "# HELP hyperframes_failed_total Total failed HyperFrames jobs",
    "# TYPE hyperframes_failed_total counter",
    `hyperframes_failed_total ${metrics.failedTotal}`,
    "# HELP hyperframes_completed_last_24h Completed HyperFrames jobs in the last 24 hours",
    "# TYPE hyperframes_completed_last_24h gauge",
    `hyperframes_completed_last_24h ${metrics.completedLast24h}`,
    "# HELP hyperframes_failed_last_24h Failed HyperFrames jobs in the last 24 hours",
    "# TYPE hyperframes_failed_last_24h gauge",
    `hyperframes_failed_last_24h ${metrics.failedLast24h}`,
    "# HELP hyperframes_free_disk_mb Free disk in MB for HyperFrames output location",
    "# TYPE hyperframes_free_disk_mb gauge",
    `hyperframes_free_disk_mb ${metrics.freeDiskMb ?? -1}`,
    "# HELP hyperframes_service_active Systemd worker active status (1=true,0=false,-1=unknown)",
    "# TYPE hyperframes_service_active gauge",
    `hyperframes_service_active ${serviceActive}`,
    "",
  ].join("\n");
}
