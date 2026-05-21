import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateSocialDraftService, type SocialChannel, type SocialDraftStatus } from "@/services/ShopeeAffiliateSocialDraftService";

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const channel = (searchParams.get("channel") ?? undefined) as SocialChannel | undefined;
  const status = (searchParams.get("status") ?? undefined) as SocialDraftStatus | undefined;
  const productId = searchParams.get("productId") ?? undefined;
  const items = await shopeeAffiliateSocialDraftService.list(request.auth.userId, { channel, status, productId });
  return NextResponse.json({ ok: true, data: { items } });
});

export const POST = withAuth(async (request) => {
  const body = await request.json();
  const draft = await shopeeAffiliateSocialDraftService.create(request.auth.userId, body);
  return NextResponse.json({ ok: true, data: draft }, { status: 201 });
});
