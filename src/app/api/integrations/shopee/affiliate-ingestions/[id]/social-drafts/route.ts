import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateSocialDraftService, type SocialChannel } from "@/services/ShopeeAffiliateSocialDraftService";

export const POST = withAuth(async (request, { params }) => {
  const body = await request.json().catch(() => ({}));
  const channel = String(body?.channel ?? "") as SocialChannel;
  const draft = body?.content
    ? await shopeeAffiliateSocialDraftService.create(request.auth.userId, { ...body, ingestionId: params.id, channel })
    : await shopeeAffiliateSocialDraftService.generateInitialDraft(request.auth.userId, params.id, channel);
  return NextResponse.json({ ok: true, data: draft });
});

export const PATCH = withAuth(async (request) => {
  const body = await request.json().catch(() => ({}));
  const draft = await shopeeAffiliateSocialDraftService.update(request.auth.userId, String(body?.draftId ?? ""), String(body?.content ?? ""));
  return NextResponse.json({ ok: true, data: draft });
});
