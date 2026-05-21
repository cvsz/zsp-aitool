import { describe, expect, it, vi } from "vitest";

import { recordApiTiming } from "@/lib/observability/api-timing";

describe("api timing", () => {
  it("logs without raw user id", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    recordApiTiming({ route: "/api/test", method: "GET", status: 200, durationMs: 100, requestId: "req-1", userId: "user-123" });
    const line = String(spy.mock.calls[0]?.[0] ?? "");
    expect(line).toContain("api.timing");
    expect(line).not.toContain("user-123");
    spy.mockRestore();
  });
});
