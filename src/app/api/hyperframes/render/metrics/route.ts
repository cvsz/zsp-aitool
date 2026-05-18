import { NextRequest, NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { getSessionFromRequest } from "@/lib/auth";
import { getHyperFramesRenderMetrics, isHyperFramesMetricsEnabled, toPrometheusMetrics } from "@/lib/hyperframes/render-metrics";

function isOperatorEmail(email: string | undefined): boolean {
  if (!email) return false;
  const allowList = (process.env.HYPERFRAMES_OPERATOR_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowList.includes(email.trim().toLowerCase());
}

function hasInternalToken(request: NextRequest): boolean {
  const expected = process.env.HYPERFRAMES_INTERNAL_TOKEN;
  if (!expected) return false;

  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ") && bearer.slice(7).trim() === expected) return true;

  const headerToken = request.headers.get("x-hyperframes-internal-token");
  return headerToken?.trim() === expected;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isHyperFramesMetricsEnabled()) {
    return NextResponse.json(failure("NOT_FOUND", "Metrics endpoint disabled"), { status: 404 });
  }

  const internal = hasInternalToken(request);
  const session = getSessionFromRequest(request);
  if (!internal && !session) {
    return NextResponse.json(failure("UNAUTHORIZED", "Authentication required"), { status: 401 });
  }

  if (!internal && !isOperatorEmail(session?.email)) {
    return NextResponse.json(failure("FORBIDDEN", "Operator access required"), { status: 403 });
  }

  const metrics = await getHyperFramesRenderMetrics();
  const format = new URL(request.url).searchParams.get("format");
  if (format === "prometheus") {
    return new NextResponse(toPrometheusMetrics(metrics), {
      status: 200,
      headers: { "content-type": "text/plain; version=0.0.4; charset=utf-8" },
    });
  }

  return NextResponse.json(success(metrics));
}
