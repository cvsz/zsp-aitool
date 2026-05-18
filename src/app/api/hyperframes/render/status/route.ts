import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";
import { getHyperFramesOperatorStatus, isOperatorStatusEnabled } from "@/lib/hyperframes/operator-status";

export const GET = withAuth(async () => {
  if (!isOperatorStatusEnabled()) {
    return NextResponse.json(failure("NOT_FOUND", "Operator status endpoint disabled"), { status: 404 });
  }

  const status = await getHyperFramesOperatorStatus();
  return NextResponse.json(success(status));
});
