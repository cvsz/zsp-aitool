import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, failure } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (request) => {
  try {
    const rows = await prisma.contentGeneration.findMany({
      where: { userId: request.auth.userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(success(rows));
  } catch {
    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to load content history"), { status: 500 });
  }
});
