import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, failure } from "@/lib/api-response";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.contentGeneration.findUnique({ where: { id }, include: { product: true } });
  if (!row) return NextResponse.json(failure("NOT_FOUND", "History not found"), { status: 404 });
  return NextResponse.json(success(row));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.contentGeneration.delete({ where: { id } });
    return NextResponse.json(success({ id }));
  } catch {
    return NextResponse.json(failure("NOT_FOUND", "History not found"), { status: 404 });
  }
}
