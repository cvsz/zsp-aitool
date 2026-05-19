import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { isAdminPanelEnabled } from "@/lib/admin/access";
import { getAdminOverviewSummary } from "@/services/admin-overview-service";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async () => {
  if (!isAdminPanelEnabled()) {
    return NextResponse.json(failure("ADMIN_DISABLED", "Admin panel is disabled"), { status: 403 });
  }

  const summary = await getAdminOverviewSummary();
  return NextResponse.json(success(summary));
});
