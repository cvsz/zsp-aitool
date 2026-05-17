import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { ExportService } from "@/services/ExportService";

const exportService = new ExportService();

export const GET = withAuth(async (request) => {
  const csv = await exportService.exportProductsCsv(request.auth.userId);
  const filename = "products-export.csv";
  return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` } });
});
