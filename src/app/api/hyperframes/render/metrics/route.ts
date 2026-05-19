import { NextRequest, NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { getSessionFromRequest } from "@/lib/auth";
import { getHyperFramesRenderMetrics, hasRenderMetricsAccess, isHyperFramesMetricsEnabled, toPrometheusMetrics } from "@/lib/hyperframes/render-metrics";

function getInternalToken(request: NextRequest): string | null {
  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) return bearer.slice(7).trim();
  return request.headers.get("x-hyperframes-internal-token");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isHyperFramesMetricsEnabled()) return NextResponse.json(failure("NOT_FOUND", "Metrics endpoint disabled"), { status: 404 });
  const session = getSessionFromRequest(request);
  if (!hasRenderMetricsAccess({ email: session?.email, internalToken: getInternalToken(request) })) {
    return NextResponse.json(failure(session ? "FORBIDDEN" : "UNAUTHORIZED", session ? "Operator access required" : "Authentication required"), { status: session ? 403 : 401 });
  }
  const metrics = await getHyperFramesRenderMetrics();
  if (new URL(request.url).searchParams.get("format") === "prometheus") return new NextResponse(toPrometheusMetrics(metrics), { headers: { "Content-Type": "text/plain; version=0.0.4" } });
  return NextResponse.json(success(metrics));
}
