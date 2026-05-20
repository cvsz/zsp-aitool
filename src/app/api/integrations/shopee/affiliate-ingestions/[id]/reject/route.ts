import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateIngestionService } from "@/services/ShopeeAffiliateIngestionService";

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim().slice(0, 300) : "Rejected by user";
    const data = await shopeeAffiliateIngestionService.reject(request.auth.userId, id, reason);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "INGESTION_NOT_FOUND", message: "ไม่พบรายการนำเข้าหรือคุณไม่มีสิทธิ์เข้าถึง" } }, { status: 404 });
  }
});
