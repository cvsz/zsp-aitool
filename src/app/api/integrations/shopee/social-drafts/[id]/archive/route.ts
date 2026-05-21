import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateSocialDraftService } from "@/services/ShopeeAffiliateSocialDraftService";

export const POST = withAuth(async (request, { params }) => {
  const body = await request.json().catch(() => ({}));
  const data = await shopeeAffiliateSocialDraftService.archive(request.auth.userId, params.id, Boolean(body?.reject));
  return NextResponse.json({ ok: true, data });
});
