import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { shopeeAffiliateSocialDraftService, type SocialChannel } from "@/services/ShopeeAffiliateSocialDraftService";

const channels = new Set<SocialChannel>(["facebook", "threads", "x", "instagram", "tiktok", "youtube_shorts"]);

export const POST = withAuth(async (request, { params }) => {
  const body = await request.json().catch(() => ({}));
  const channel = typeof body?.channel === "string" ? body.channel as SocialChannel : null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!channel || !channels.has(channel) || !content) return NextResponse.json({ ok: false, error: { message: "INVALID_PAYLOAD" } }, { status: 400 });
  const draft = await shopeeAffiliateSocialDraftService.create(request.auth.userId, params.id, channel, content);
  return NextResponse.json({ ok: true, data: draft });
});

export const PATCH = withAuth(async (request) => {
  const body = await request.json().catch(() => ({}));
  const draftId = typeof body?.draftId === "string" ? body.draftId : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!draftId || !content) return NextResponse.json({ ok: false, error: { message: "INVALID_PAYLOAD" } }, { status: 400 });
  const draft = await shopeeAffiliateSocialDraftService.update(request.auth.userId, draftId, content);
  return NextResponse.json({ ok: true, data: draft });
});
