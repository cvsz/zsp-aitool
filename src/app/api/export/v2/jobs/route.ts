import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth-middleware";

export const POST = withAuth(async (request) => {
  const body = (await request.json()) as { type?: string; format?: string; filters?: unknown };
  const job = await prisma.exportJob.create({
    data: { userId: request.auth.userId, type: body.type ?? "products", format: body.format ?? "csv", filters: body.filters as object | undefined },
    select: { id: true, type: true, format: true, status: true, createdAt: true },
  });
  return NextResponse.json({ job }, { status: 201 });
});

export const GET = withAuth(async (request) => {
  const jobs = await prisma.exportJob.findMany({ where: { userId: request.auth.userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, type: true, format: true, status: true, rowCount: true, outputFileName: true, errorSummary: true, createdAt: true, completedAt: true, failedAt: true } });
  return NextResponse.json({ jobs });
});
