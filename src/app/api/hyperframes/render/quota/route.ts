import { NextResponse } from "next/server";

import { withAuth } from "@/middleware/auth-middleware";
import { getUserHyperFramesPlan, getUserPlanUsage } from "@/lib/hyperframes/subscription-limits";

export const GET = withAuth(async (request) => {
  const plan = await getUserHyperFramesPlan(request.auth.userId);
  const usage = await getUserPlanUsage(request.auth.userId, plan);
  return NextResponse.json({ ok: true, data: { plan, usage: usage.monthCount, remaining: usage.monthlyRemaining, limits: usage.limits } });
});
