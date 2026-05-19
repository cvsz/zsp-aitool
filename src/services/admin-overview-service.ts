import { RenderJobStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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
};

export async function getAdminOverviewSummary(): Promise<AdminOverviewSummary> {
  const [users, products, contentGenerations, renderJobs, failedRenders, pendingRenders, runningRenders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.contentGeneration.count({ where: { deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: RenderJobStatus.FAILED } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: RenderJobStatus.PENDING } }),
    prisma.hyperFrameRenderJob.count({ where: { deletedAt: null, status: RenderJobStatus.RUNNING } }),
  ]);

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
  };
}
