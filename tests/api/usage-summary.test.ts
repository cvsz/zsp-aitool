import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/usage/summary/route";

vi.mock("@/lib/auth", () => ({ getSessionFromRequest: vi.fn().mockReturnValue({ userId: "u1", email: "u1@example.com" }) }));
vi.mock("@/services/usage-summary-service", () => ({
  getUserUsageSummary: vi.fn().mockResolvedValue({
    plan: "FREE",
    usage: { products: 1, aiGenerations: 2, exports: 3, ocrJobs: 4, hyperframesRenders: 5, hyperframesStorageMb: 6 },
    limits: { aiPerMinute: 30, ocrPerMinute: 20, hyperframesMonthlyRenders: 10, hyperframesMonthlyRemaining: 5, hyperframesStorageMb: 1024 },
    workspace: { memberships: 1, rbacEnabled: true, note: "safe" },
  }),
}));

describe("usage summary api", () => {
  it("returns safe scoped usage summary", async () => {
    const res = await GET(new Request("http://localhost/api/usage/summary") as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    const raw = JSON.stringify(body);
    expect(raw).not.toContain("outputPath");
    expect(raw).not.toContain("/var/lib");
    expect(raw).not.toContain("token");
  });
});
