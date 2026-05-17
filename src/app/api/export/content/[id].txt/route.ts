import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ExportService } from "@/services/ExportService";

const exportService = new ExportService();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const content = await exportService.exportSingleContentTxt(userId, id);

  if (!content) {
    return new NextResponse("Content not found", { status: 404 });
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="content-${id}.txt"`,
    },
  });
}
