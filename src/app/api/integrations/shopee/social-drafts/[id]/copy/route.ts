import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateSocialDraftService } from "@/services/ShopeeAffiliateSocialDraftService";

export const POST = withAuth(async (request, { params }) => {
  const data = await shopeeAffiliateSocialDraftService.markCopied(request.auth.userId, params.id);
  return NextResponse.json({ ok: true, data: { ...data, copyableBody: data.content } });
});
