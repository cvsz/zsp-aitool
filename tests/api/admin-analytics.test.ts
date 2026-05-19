import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/admin/analytics/route";

vi.mock("@/lib/auth", () => ({ getSessionFromRequest: vi.fn().mockReturnValue({ userId: "u1", email: "admin@example.com" }) }));
vi.mock("@/services/GrowthAnalyticsService", () => ({ growthAnalyticsService: { getAdminSummary: vi.fn().mockResolvedValue({ metrics: { registeredUsersCount: 1 } }) } }));

describe("admin analytics api", () => {
  it("blocks when admin panel disabled", async () => {
    process.env.ADMIN_PANEL_ENABLED = "false";
    const response = await GET(new Request("http://localhost/api/admin/analytics") as never);
    expect(response.status).toBe(403);
  });

  it("returns aggregate analytics when enabled", async () => {
    process.env.ADMIN_PANEL_ENABLED = "true";
    const response = await GET(new Request("http://localhost/api/admin/analytics") as never);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(JSON.stringify(body)).not.toContain("outputPath");
    expect(JSON.stringify(body)).not.toContain("/var/lib");
  });
});
