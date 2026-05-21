import { NextRequest, NextResponse } from "next/server";

import { failure } from "@/lib/api-response";
import { isAdminPanelEnabled } from "@/lib/admin/access";
import { withAuth } from "@/middleware/auth-middleware";
import { getRecentObservabilityEvents } from "@/services/ObservabilityService";

export const GET = withAuth(async (request: NextRequest) => {
  if (!isAdminPanelEnabled()) return NextResponse.json(failure("ADMIN_DISABLED", "Admin panel is disabled"), { status: 403 });
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");
  const data = await getRecentObservabilityEvents(limit);
  return NextResponse.json({ ok: true, data });
});
