import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { enforceRenderLimits } from "@/lib/hyperframes/subscription-limits";

export const GET = withAuth(async (request) => {
  const result = await enforceRenderLimits({ userId: request.auth.userId, durationSeconds: 0 });
  if (!result.allowed) {
    return NextResponse.json({ ok: true, data: { plan: result.plan, limits: result.limits, usage: result.usage } });
  }
  return NextResponse.json({ ok: true, data: { plan: result.plan, limits: result.limits, usage: result.usage } });
});
