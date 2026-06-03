import { RenderJobStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { success } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (request) => {
  const userId = request.auth.userId;

  const [productCount, generatedContentCount, promptTemplateCount, renderJobCount, pendingRenders, runningRenders, failedRenders] = await Promise.all([
    prisma.product.count({ where: { userId, deletedAt: null } }),
    prisma.contentGeneration.count({ where: { userId, deletedAt: null } }),
    prisma.promptPreset.count({ where: { userId, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null } }),
    prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null, status: RenderJobStatus.PENDING } }),
    prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null, status: RenderJobStatus.RUNNING } }),
    prisma.hyperFrameRenderJob.count({ where: { userId, deletedAt: null, status: RenderJobStatus.FAILED } }),
  ]);

  const failed24h = await prisma.hyperFrameRenderJob.count({
    where: { userId, deletedAt: null, status: RenderJobStatus.FAILED, createdAt: { gte: new Date(Date.now() - 86400000) } },
  });

  const hyperframesHealth = pendingRenders + runningRenders === 0 && failedRenders === 0
    ? "พร้อมใช้งาน"
    : failed24h > 0
      ? "ต้องตรวจสอบ"
      : "กำลังตรวจสอบ";

  const recentActivity: { title: string; at: string }[] = [];

  const [recentProducts, recentRenders, recentContent] = await Promise.all([
    prisma.product.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 3, select: { title: true, createdAt: true } }),
    prisma.hyperFrameRenderJob.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, status: true, createdAt: true } }),
    prisma.contentGeneration.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, platform: true, createdAt: true } }),
  ]);

  for (const p of recentProducts) {
    recentActivity.push({ title: `เพิ่มสินค้า: ${p.title.slice(0, 40)}`, at: p.createdAt.toISOString().slice(0, 10) });
  }
  for (const r of recentRenders) {
    recentActivity.push({ title: `เรนเดอร์: ${r.status}`, at: r.createdAt.toISOString().slice(0, 10) });
  }
  for (const c of recentContent) {
    recentActivity.push({ title: `สร้างคอนเทนต์: ${c.platform}`, at: c.createdAt.toISOString().slice(0, 10) });
  }
  recentActivity.sort((a, b) => b.at.localeCompare(a.at));
  const limited = recentActivity.slice(0, 8);

  return NextResponse.json(success({
    productCount,
    generatedContentCount,
    promptTemplateCount,
    renderJobCount,
    hyperframesHealth,
    recentActivity: limited,
  }));
});
