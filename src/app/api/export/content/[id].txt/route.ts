import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { ExportService } from "@/services/ExportService";

const exportService = new ExportService();

export const GET = withAuth(async (request, context: { params: Promise<Record<string, string>> }) => {
  const id = (await context.params).id;
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "content";
  const content = await exportService.exportSingleContentTxt(request.auth.userId, id);
  if (!content) return new NextResponse("Content not found", { status: 404 });
  return new NextResponse(content, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="content-${safeId}.txt"` } });
});
