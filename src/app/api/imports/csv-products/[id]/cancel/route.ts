import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { CsvProductImportJobService } from "@/services/CsvProductImportJobService";
export const POST = withAuth(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  await CsvProductImportJobService.cancel(req.auth.userId, id);
  return NextResponse.json({ ok: true });
});
