import { NextRequest, NextResponse } from "next/server";

import { failure } from "@/lib/api-response";
import { getSessionFromRequest } from "@/lib/auth";

export type AuthenticatedRequest = NextRequest & {
  auth: {
    userId: string;
    email: string;
  };
};

export function withAuth<TArgs extends unknown[]>(
  handler: (request: AuthenticatedRequest, ...args: TArgs) => Promise<NextResponse>
): (request: NextRequest, ...args: TArgs) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: TArgs) => {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(failure("UNAUTHORIZED", "Authentication required"), { status: 401 });
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.auth = { userId: session.userId, email: session.email };

    return handler(authenticatedRequest, ...args);
  };
}
