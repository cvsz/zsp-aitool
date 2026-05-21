import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateSocialDraftService } from "@/services/ShopeeAffiliateSocialDraftService";

export const GET = withAuth(async (request, { params }) => NextResponse.json({ ok: true, data: await shopeeAffiliateSocialDraftService.getById(request.auth.userId, params.id) }));
export const PATCH = withAuth(async (request, { params }) => {
  const body = await request.json();
  const data = await shopeeAffiliateSocialDraftService.update(request.auth.userId, params.id, String(body?.content ?? ""));
  return NextResponse.json({ ok: true, data });
});
export const DELETE = withAuth(async (request, { params }) => NextResponse.json({ ok: true, data: { deleted: await shopeeAffiliateSocialDraftService.softDelete(request.auth.userId, params.id) } }));
