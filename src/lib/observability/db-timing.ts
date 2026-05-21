import { logEvent, safeErrorShape } from "@/lib/observability/logger";

export async function withDbTiming<T>(operation: string, action: () => Promise<T>): Promise<T> {
  const startedAt = Date.now();
  try {
    const result = await action();
    logEvent("info", "db.timing", {
      source: "db",
      operation,
      durationMs: Date.now() - startedAt,
      status: "ok",
    });
    return result;
  } catch (error) {
    logEvent("error", "db.timing", {
      source: "db",
      operation,
      durationMs: Date.now() - startedAt,
      status: "error",
      error: safeErrorShape(error),
    });
    throw error;
  }
}
