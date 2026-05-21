import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/access", () => ({ isAdminPanelEnabled: vi.fn().mockReturnValue(true) }));
vi.mock("@/lib/auth", () => ({ getSessionFromRequest: vi.fn().mockReturnValue({ userId: "u1", email: "a@b.com" }) }));
vi.mock("@/services/ObservabilityService", () => ({ getObservabilitySummary: vi.fn().mockResolvedValue({ errorsLast1h: 0, errorsLast24h: 0, slowApiRoutes: [], dbLatencySummary: { avgDurationMs: 0, p95DurationMs: 0 }, worker: null, imports: {}, aiQueue: {} }) }));

import { GET } from "@/app/api/admin/observability/summary/route";

describe("admin observability api", () => {
  it("allows authenticated admin endpoint", async () => {
    const req = new NextRequest("http://localhost/api/admin/observability/summary");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });
});
