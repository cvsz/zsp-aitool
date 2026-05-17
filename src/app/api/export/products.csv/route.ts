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

  const csv = await exportService.exportProductsCsv(userId);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="products.csv"',
    },
  });
}
