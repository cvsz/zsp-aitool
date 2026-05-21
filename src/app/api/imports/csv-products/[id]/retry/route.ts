import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { CsvProductImportJobService } from "@/services/CsvProductImportJobService";
export const POST = withAuth(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const job = await CsvProductImportJobService.retry(req.auth.userId, id);
  if (!job) return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });
  return NextResponse.json({ ok: true, data: { ...job, sourceFilePath: undefined } });
});
