import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateIngestionService } from "@/services/ShopeeAffiliateIngestionService";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const data = await shopeeAffiliateIngestionService.importApproved(request.auth.userId, id);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INGESTION_IMPORT_FAILED";
    const message = code === "INGESTION_MISSING_URLS"
      ? "รายการนี้ไม่มี URL ครบถ้วน"
      : code === "INGESTION_NOT_IMPORTABLE"
      ? "รายการนี้ไม่สามารถ import ได้ในสถานะปัจจุบัน"
      : "ไม่สามารถ import รายการนี้ได้";
    return NextResponse.json({ ok: false, error: { code, message } }, { status: 422 });
  }
});
