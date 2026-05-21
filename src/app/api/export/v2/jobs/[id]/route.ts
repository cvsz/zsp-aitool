import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const job = await prisma.exportJob.findFirst({ where: { id: id, userId: request.auth.userId, deletedAt: null }, select: { id: true, type: true, format: true, status: true, rowCount: true, outputFileName: true, errorSummary: true, createdAt: true, completedAt: true, failedAt: true } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
});
