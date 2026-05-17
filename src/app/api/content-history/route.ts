import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, failure } from "@/lib/api-response";

export async function GET() {
  try {
    const rows = await prisma.contentGeneration.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(success(rows));
  } catch {
    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to load content history"), { status: 500 });
  }
}
