import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, failure } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const row = await prisma.contentGeneration.findFirst({ where: { id, userId: request.auth.userId, deletedAt: null }, include: { product: true } });
  if (!row) return NextResponse.json(failure("NOT_FOUND", "History not found"), { status: 404 });
  return NextResponse.json(success(row));
});

export const DELETE = withAuth(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const deleted = await prisma.contentGeneration.updateMany({ where: { id, userId: request.auth.userId, deletedAt: null }, data: { deletedAt: new Date() } });
  if (deleted.count === 0) return NextResponse.json(failure("NOT_FOUND", "History not found"), { status: 404 });
  return NextResponse.json(success({ id }));
});
