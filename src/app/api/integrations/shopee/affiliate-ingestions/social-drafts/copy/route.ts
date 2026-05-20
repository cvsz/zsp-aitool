import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateSocialDraftService } from "@/services/ShopeeAffiliateSocialDraftService";

export const POST = withAuth(async (request) => {
  const body = await request.json().catch(() => ({}));
  const draftId = typeof body?.draftId === "string" ? body.draftId : "";
  if (!draftId) return NextResponse.json({ ok: false, error: { message: "INVALID_PAYLOAD" } }, { status: 400 });
  const draft = await shopeeAffiliateSocialDraftService.markCopied(request.auth.userId, draftId);
  return NextResponse.json({ ok: true, data: draft });
});
