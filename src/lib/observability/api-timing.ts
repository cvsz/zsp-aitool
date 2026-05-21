import { hashUserId, logEvent } from "@/lib/observability/logger";

export type ApiTimingInput = {
  route: string;
  method: string;
  status: number;
  durationMs: number;
  requestId: string;
  userId?: string;
};

export function recordApiTiming(input: ApiTimingInput): void {
  const safeUserId = input.userId ? hashUserId(input.userId) : undefined;
  logEvent(input.durationMs >= 1500 ? "warn" : "info", "api.timing", {
    source: "api",
    route: input.route,
    method: input.method,
    status: input.status,
    durationMs: Math.round(input.durationMs),
    requestId: input.requestId,
    userId: safeUserId,
  });
}
