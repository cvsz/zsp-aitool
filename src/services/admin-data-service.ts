import { prisma } from "@/lib/prisma";

export type AdminUsersSummary = {
  totalUsers: number;
  newUsers7d: number;
  flaggedAccounts: number;
  byPlan: { plan: string; count: number }[];
};

export type AdminProductsSummary = {
  totalProducts: number;
  addedToday: number;
  topCategory: string;
  categoryCounts: { category: string; count: number }[];
};

export type AdminContentSummary = {
  totalContent: number;
  completed: number;
  failed: number;
  byPlatform: { platform: string; count: number }[];
};

export type AdminRendersSummary = {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
};

export type AdminSettingsSummary = {
  adminPanelEnabled: boolean;
  dangerousActionsEnabled: false;
  dataExposurePolicy: string;
  totalUsers: number;
  totalProducts: number;
  totalRenders: number;
};

export type AdminSystemStatus = {
  appHealth: "healthy" | "degraded";
  schemaDrift: "ok" | "unknown";
  hyperframesQueue: { pending: number; running: number; failed24h: number; watchdogConfigured: boolean };
  shopeeFoundation: { enabled: boolean; foundationReady: boolean; environment: string; configured: boolean };
  recentFailures24h: number;
  totalJobs: number;
};

export async function getAdminUsersSummary(): Promise<AdminUsersSummary> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const [totalUsers, newUsers7d, flaggedAccounts, byPlanData] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { planTier: "FREE" } }),
    prisma.$queryRawUnsafe<{ planTier: string; count: bigint }[]>("SELECT \"planTier\", COUNT(*) as count FROM \"User\" GROUP BY \"planTier\""),
  ]);

  return {
    totalUsers,
    newUsers7d,
    flaggedAccounts,
    byPlan: byPlanData.map((d) => ({ plan: d.planTier, count: Number(d.count) })),
  };
}

export async function getAdminProductsSummary(): Promise<AdminProductsSummary> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalProducts, addedToday, categoryData] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, createdAt: { gte: today } } }),
    prisma.product.groupBy({ by: ["category"], _count: true, orderBy: { _count: { category: "desc" } }, take: 1 }),
  ]);

  const allCategories = await prisma.product.groupBy({
    by: ["category"], _count: true, orderBy: { _count: { category: "desc" } }, take: 10,
  });

  return {
    totalProducts,
    addedToday,
    topCategory: (categoryData[0] as { category: string | null; _count: number } | undefined)?.category ?? "ไม่มีหมวดหมู่",
    categoryCounts: (allCategories as { category: string | null; _count: number }[]).map((d) => ({
      category: d.category ?? "ไม่มีหมวดหมู่",
      count: d._count,
    })),
  };
}

export async function getAdminContentSummary(): Promise<AdminContentSummary> {
  const [totalContent, completed, failed, platformData] = await Promise.all([
    prisma.contentGeneration.count({ where: { deletedAt: null } }),
    prisma.contentGeneration.count({ where: { deletedAt: null, status: "COMPLETED" as never } }),
    prisma.contentGeneration.count({ where: { deletedAt: null, status: "FAILED" as never } }),
    prisma.contentGeneration.groupBy({ by: ["platform"], _count: true, orderBy: { _count: { platform: "desc" } } }),
  ]);

  return {
    totalContent,
    completed,
    failed,
    byPlatform: (platformData as { platform: string; _count: number }[]).map((d) => ({
      platform: d.platform,
      count: d._count,
    })),
  };
}

export async function getAdminRendersSummary(): Promise<AdminRendersSummary> {
  const counts = await Promise.all([
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: "PENDING" as never } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: "RUNNING" as never } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: "COMPLETED" as never } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: "FAILED" as never } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: "CANCELLED" as never } }),
  ]);

  return {
    pending: counts[0], running: counts[1], completed: counts[2],
    failed: counts[3], cancelled: counts[4],
  };
}

export async function getAdminSettingsSummary(): Promise<AdminSettingsSummary> {
  const [totalUsers, totalProducts, totalRenders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null } }),
  ]);

  return {
    adminPanelEnabled: process.env.ADMIN_PANEL_ENABLED === "true",
    dangerousActionsEnabled: false,
    dataExposurePolicy: "Aggregate only",
    totalUsers,
    totalProducts,
    totalRenders,
  };
}

export async function getAdminSystemStatus(): Promise<AdminSystemStatus> {
  const [failed24h, pending, running, totalJobs] = await Promise.all([
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: "FAILED" as never, createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: "PENDING" as never } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: "RUNNING" as never } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null } }),
  ]);

  return {
    appHealth: failed24h > 0 ? "degraded" : "healthy",
    schemaDrift: process.env.npm_package_scripts_db_schema_drift_check !== undefined ? "ok" : "unknown",
    hyperframesQueue: {
      pending,
      running,
      failed24h,
      watchdogConfigured: process.env.HYPERFRAMES_WATCHDOG_STALE_RUNNING_MINUTES !== undefined,
    },
    shopeeFoundation: {
      enabled: process.env.SHOPEE_OPEN_API_ENABLED === "true",
      foundationReady: process.env.SHOPEE_OPEN_API_KEY !== undefined,
      environment: process.env.SHOPEE_OPEN_API_ENVIRONMENT ?? "sandbox",
      configured: process.env.SHOPEE_OPEN_API_KEY !== undefined && process.env.SHOPEE_OPEN_API_PARTNER_ID !== undefined,
    },
    recentFailures24h: failed24h,
    totalJobs,
  };
}
