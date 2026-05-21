import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { statfsSync } from "node:fs";

import { ShopeeAffiliateIngestionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getHyperFramesOperatorStatus } from "@/lib/hyperframes/operator-status";

const execFileAsync = promisify(execFile);

type ServiceState = { active?: boolean; enabled?: boolean; warning?: string };
export type BackendMonitorData = {
  app: { reachable: boolean; serviceActive?: boolean; serviceEnabled?: boolean };
  worker: { serviceActive?: boolean; serviceEnabled?: boolean };
  db: { reachable: boolean; productCount: number; affiliateLinkCount: number; ingestionByStatus: Record<string, number> };
  hyperframes: { pending: number; running: number; staleRunning: number; failedLast24h: number } | null;
  system: { freeDiskMb?: number; checkedAt: string };
  warnings: string[];
};

export function redactSensitiveText(input: string): string {
  return input
    .replace(/(DATABASE_URL|API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*[^\s]+/gi, "$1=[REDACTED]")
    .replace(/bearer\s+[a-z0-9._\-]+/gi, "bearer [REDACTED]")
    .replace(/\/home\/[\w\-/.]+/gi, "/home/[REDACTED]")
    .replace(/\/var\/lib\/[\w\-/.]+/gi, "/var/lib/[REDACTED]");
}

async function systemctlState(name: string): Promise<ServiceState> {
  try {
    const active = (await execFileAsync("systemctl", ["is-active", name], { timeout: 2000 })).stdout.trim() === "active";
    const enabled = (await execFileAsync("systemctl", ["is-enabled", name], { timeout: 2000 })).stdout.trim() === "enabled";
    return { active, enabled };
  } catch {
    return { warning: `service-check-unavailable:${name}` };
  }
}

async function checkHttpReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}

function getFreeDiskMb(pathname: string): number | undefined {
  try { const s = statfsSync(pathname); return Math.floor((Number(s.bavail) * Number(s.bsize)) / (1024 * 1024)); } catch { return undefined; }
}

export async function collectBackendMonitorData(): Promise<BackendMonitorData> {
  const warnings: string[] = [];
  const [appSvc, workerSvc, appReachable] = await Promise.all([
    systemctlState("zsp-aitool"),
    systemctlState("zsp-hyperframes-worker"),
    checkHttpReachable("http://127.0.0.1:3001/"),
  ]);
  if (appSvc.warning) warnings.push(appSvc.warning);
  if (workerSvc.warning) warnings.push(workerSvc.warning);

  let db: BackendMonitorData["db"] = { reachable: false, productCount: 0, affiliateLinkCount: 0, ingestionByStatus: {} };
  try {
    const [productCount, affiliateLinkCount, ingestionGroups] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.affiliateLink.count({ where: { deletedAt: null } }),
      prisma.shopeeAffiliateIngestion.groupBy({ by: ["status"], _count: { _all: true }, where: { deletedAt: null } }),
    ]);
    const ingestionByStatus: Record<string, number> = Object.values(ShopeeAffiliateIngestionStatus).reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as Record<string, number>);
    for (const row of ingestionGroups) ingestionByStatus[row.status] = row._count._all;
    db = { reachable: true, productCount, affiliateLinkCount, ingestionByStatus };
  } catch {
    warnings.push("db-unreachable");
  }

  let hyperframes: BackendMonitorData["hyperframes"] = null;
  try {
    const queue = await getHyperFramesOperatorStatus();
    hyperframes = { pending: queue.pending, running: queue.running, staleRunning: queue.staleRunning, failedLast24h: queue.failedLast24h };
  } catch {
    warnings.push("hyperframes-status-unavailable");
  }

  return {
    app: { reachable: appReachable, serviceActive: appSvc.active, serviceEnabled: appSvc.enabled },
    worker: { serviceActive: workerSvc.active, serviceEnabled: workerSvc.enabled },
    db,
    hyperframes,
    system: { freeDiskMb: getFreeDiskMb("."), checkedAt: new Date().toISOString() },
    warnings,
  };
}
