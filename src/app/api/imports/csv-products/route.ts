import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { CsvProductImportJobService } from "@/services/CsvProductImportJobService";

export const GET = withAuth(async (req) => {
  const jobs = await CsvProductImportJobService.list(req.auth.userId);
  return NextResponse.json({ ok: true, data: jobs.map((job) => ({ ...job, sourceFilePath: undefined })) });
});
export const POST = withAuth(async (req) => {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: { message: "file is required" } }, { status: 400 });
  try { const job = await CsvProductImportJobService.createFromUpload(req.auth.userId, file); return NextResponse.json({ ok: true, data: { ...job, sourceFilePath: undefined } }); }
  catch (error) { return NextResponse.json({ ok: false, error: { message: error instanceof Error ? error.message : "create failed" } }, { status: 400 }); }
});
