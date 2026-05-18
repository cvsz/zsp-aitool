import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { getHyperFramesOperatorStatus } from "@/lib/hyperframes/operator-status";
import { canAccessOperatorControls, isOperatorControlsEnabled } from "@/lib/hyperframes/operator-access";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (request) => {
  if (!isOperatorControlsEnabled()) {
    return NextResponse.json(failure("FORBIDDEN", "Operator controls disabled"), { status: 403 });
  }
  if (!canAccessOperatorControls(request)) {
    return NextResponse.json(failure("FORBIDDEN", "Operator access required"), { status: 403 });
  }

  const status = await getHyperFramesOperatorStatus();
  return NextResponse.json(success({
    pending: status.pending,
    running: status.running,
    failedLast24h: status.failedLast24h,
    staleRunning: status.staleRunning,
    serviceActive: status.serviceActive,
    diskFreeMb: status.diskFreeMb,
  }));
});
