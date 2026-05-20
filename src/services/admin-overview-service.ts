import { RenderJobStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { loadShopeeOpenApiConfig, toShopeeOpenApiSafeStatus } from "@/lib/shopee/open-api-config";

export type AdminOverviewSummary = {
  totals: {
    users: number;
    products: number;
    contentGenerations: number;
    renderJobs: number;
    failedRenders: number;
    pendingRenders: number;
    runningRenders: number;
  };
  system: {
    adminPanelEnabled: boolean;
    dangerousActionsEnabled: false;
    dataPolicy: "aggregate-only";
    systemdControlFromUi: false;
  };
  ops: {
    appHealth: "healthy" | "degraded";
    schemaDrift: "ok" | "unknown";
    hyperframesQueue: {
      pending: number;
      running: number;
      failed24h: number;
      watchdogConfigured: boolean;
    };
    shopeeFoundation: {
      enabled: boolean;
      foundationReady: boolean;
      environment: "sandbox" | "live";
      configured: boolean;
    };
    recentAggregateEvents: {
      newUsers7d: number;
      newProducts7d: number;
      newRenderJobs24h: number;
      failedRenderJobs24h: number;
    };
  };
};

export async function getAdminOverviewSummary(): Promise<AdminOverviewSummary> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

  const [users, products, contentGenerations, renderJobs, failedRenders, pendingRenders, runningRenders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.contentGeneration.count({ where: { deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: RenderJobStatus.FAILED } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: RenderJobStatus.PENDING } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: RenderJobStatus.RUNNING } }),
  ]);

  const [newUsers7d, newProducts7d, newRenderJobs24h, failedRenderJobs24h] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.product.count({ where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, createdAt: { gte: twentyFourHoursAgo } } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, createdAt: { gte: twentyFourHoursAgo }, status: RenderJobStatus.FAILED } }),
  ]);

  const shopeeSafeStatus = toShopeeOpenApiSafeStatus(loadShopeeOpenApiConfig());
  const hasSchemaDriftScript = process.env.npm_package_scripts_db_schema_drift_check !== undefined;
  const appHealth: "healthy" | "degraded" = failedRenderJobs24h > 0 ? "degraded" : "healthy";

  return {
    totals: {
      users,
      products,
      contentGenerations,
      renderJobs,
      failedRenders,
      pendingRenders,
      runningRenders,
    },
    system: {
      adminPanelEnabled: process.env.ADMIN_PANEL_ENABLED === "true",
      dangerousActionsEnabled: false,
      dataPolicy: "aggregate-only",
      systemdControlFromUi: false,
    },
    ops: {
      appHealth,
      schemaDrift: hasSchemaDriftScript ? "ok" : "unknown",
      hyperframesQueue: {
        pending: pendingRenders,
        running: runningRenders,
        failed24h: failedRenderJobs24h,
        watchdogConfigured: process.env.HYPERFRAMES_WATCHDOG_STALE_RUNNING_MINUTES !== undefined,
      },
      shopeeFoundation: {
        enabled: shopeeSafeStatus.enabled,
        foundationReady: shopeeSafeStatus.foundationReady,
        environment: shopeeSafeStatus.environment,
        configured: shopeeSafeStatus.configured,
      },
      recentAggregateEvents: {
        newUsers7d,
        newProducts7d,
        newRenderJobs24h,
        failedRenderJobs24h,
      },
    },
  };
}
