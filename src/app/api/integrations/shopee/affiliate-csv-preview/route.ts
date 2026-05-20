import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { csvImportPreviewSchema } from "@/schemas/shopee-affiliate.schema";

function hasDangerousFormula(value: string): boolean {
  return /^[\s]*[=+\-@]/.test(value);
}

export const POST = withAuth(async (request) => {
  const parsed = csvImportPreviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "CSV ไม่ถูกต้อง", details: parsed.error.flatten() } }, { status: 422 });
  }

  const lines = parsed.data.csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return NextResponse.json({ ok: false, error: { code: "EMPTY_CSV", message: "CSV ว่างเปล่า" } }, { status: 422 });

  const rows = lines.map((line) => line.split(",").map((cell) => cell.trim()));
  const formulaDetected = rows.some((row) => row.some((cell) => hasDangerousFormula(cell)));
  if (formulaDetected) {
    return NextResponse.json({ ok: false, error: { code: "CSV_FORMULA_BLOCKED", message: "พบสูตรที่ไม่ปลอดภัยใน CSV" } }, { status: 422 });
  }

  const headers = rows[0] ?? [];
  return NextResponse.json({ ok: true, data: { headers, rowCount: Math.max(0, rows.length - 1), previewRows: rows.slice(1, 6) }, reviewRequired: true });
});
