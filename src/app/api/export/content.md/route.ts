import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ExportService } from "@/services/ExportService";

const exportService = new ExportService();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const markdown = await exportService.exportContentMarkdown(userId, {
    platform: searchParams.get("platform") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
  });

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="content-history.md"',
    },
  });
}
