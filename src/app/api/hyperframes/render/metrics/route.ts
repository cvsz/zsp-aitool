import { NextRequest, NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { getSessionFromRequest } from "@/lib/auth";
import { getRenderMetrics, hasRenderMetricsAccess, isRenderMetricsEnabled } from "@/lib/hyperframes/render-metrics";

function toPrometheus(metrics: Awaited<ReturnType<typeof getRenderMetrics>>): string {
  return [
    "# TYPE hyperframes_pending gauge",
    `hyperframes_pending ${metrics.pending}`,
    "# TYPE hyperframes_running gauge",
    `hyperframes_running ${metrics.running}`,
    "# TYPE hyperframes_completed_total counter",
    `hyperframes_completed_total ${metrics.completedTotal}`,
    "# TYPE hyperframes_failed_total counter",
    `hyperframes_failed_total ${metrics.failedTotal}`,
    "# TYPE hyperframes_completed_last_24h gauge",
    `hyperframes_completed_last_24h ${metrics.completedLast24h}`,
    "# TYPE hyperframes_failed_last_24h gauge",
    `hyperframes_failed_last_24h ${metrics.failedLast24h}`,
    "# TYPE hyperframes_disk_free_mb gauge",
    `hyperframes_disk_free_mb ${metrics.diskFreeMb ?? -1}`,
    "# TYPE hyperframes_service_active gauge",
    `hyperframes_service_active ${metrics.serviceActive === null ? -1 : metrics.serviceActive ? 1 : 0}`,
    "",
  ].join("\n");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isRenderMetricsEnabled()) {
    return NextResponse.json(failure("NOT_FOUND", "Render metrics endpoint disabled"), { status: 404 });
  }

  const session = getSessionFromRequest(request);
  const url = new URL(request.url);
  const internalToken = request.headers.get("x-hyperframes-internal-token") ?? url.searchParams.get("token");
  const hasAccess = hasRenderMetricsAccess({ email: session?.email, internalToken });

  if (!hasAccess) {
    if (!session) {
      return NextResponse.json(failure("UNAUTHORIZED", "Authentication required"), { status: 401 });
    }

    return NextResponse.json(failure("FORBIDDEN", "Operator access required"), { status: 403 });
  }

  const metrics = await getRenderMetrics();
  const format = url.searchParams.get("format");
  if (format === "prometheus") {
    return new NextResponse(toPrometheus(metrics), {
      status: 200,
      headers: { "content-type": "text/plain; version=0.0.4; charset=utf-8" },
    });
  }

  return NextResponse.json(success(metrics));
}
