import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { isAdminPanelEnabled } from "@/lib/admin/access";
import { withAuth } from "@/middleware/auth-middleware";
import { growthAnalyticsService } from "@/services/GrowthAnalyticsService";

export const GET = withAuth(async () => {
  if (!isAdminPanelEnabled()) return NextResponse.json(failure("ADMIN_DISABLED", "Admin panel is disabled"), { status: 403 });
  const summary = await growthAnalyticsService.getAdminSummary(14);
  return NextResponse.json(success(summary));
});
