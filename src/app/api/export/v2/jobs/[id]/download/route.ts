import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const job = await prisma.exportJob.findFirst({ where: { id: id, userId: request.auth.userId, deletedAt: null, status: "COMPLETED" }, select: { outputFileName: true } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse("", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${job.outputFileName ?? "export.txt"}"` } });
});
