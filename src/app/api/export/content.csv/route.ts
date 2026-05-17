import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { ExportService } from "@/services/ExportService";

const exportService = new ExportService();

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const csv = await exportService.exportContentCsv(request.auth.userId, { platform: searchParams.get("platform") ?? undefined, startDate: searchParams.get("startDate") ?? undefined, endDate: searchParams.get("endDate") ?? undefined });
  const filename = "content-history-export.csv";
  return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` } });
});
