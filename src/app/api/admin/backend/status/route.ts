import { NextResponse } from "next/server";

import { failure } from "@/lib/api-response";
import { isAdminPanelEnabled } from "@/lib/admin/access";
import { withAuth } from "@/middleware/auth-middleware";
import { collectBackendMonitorData, redactSensitiveText } from "@/services/BackendMonitorService";

export const GET = withAuth(async () => {
  if (!isAdminPanelEnabled()) return NextResponse.json(failure("ADMIN_DISABLED", "Admin panel is disabled"), { status: 403 });
  const data = await collectBackendMonitorData();
  return NextResponse.json(JSON.parse(redactSensitiveText(JSON.stringify({ ok: true, data }))));
});
