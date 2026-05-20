import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateIngestionService } from "@/services/ShopeeAffiliateIngestionService";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const data = await shopeeAffiliateIngestionService.approve(request.auth.userId, id);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "INGESTION_NOT_FOUND_OR_NOT_PENDING", message: "ไม่พบรายการรอตรวจ หรือรายการนี้ไม่ได้อยู่ในสถานะรอตรวจ" } }, { status: 404 });
  }
});
