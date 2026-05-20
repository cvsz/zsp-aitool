import { NextResponse } from "next/server";

import { success } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";
import { getUserUsageSummary } from "@/services/usage-summary-service";

export const GET = withAuth(async (request) => {
  const summary = await getUserUsageSummary(request.auth.userId);
  return NextResponse.json(success(summary));
});

