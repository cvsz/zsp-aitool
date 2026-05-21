import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/admin/backend/status/route";

vi.mock("@/services/BackendMonitorService", () => ({
  collectBackendMonitorData: vi.fn().mockResolvedValue({ app: { reachable: true }, worker: {}, db: { reachable: true, productCount: 1, affiliateLinkCount: 1, ingestionByStatus: {} }, hyperframes: null, system: { checkedAt: new Date().toISOString() }, warnings: [] }),
  redactSensitiveText: (s: string) => s,
}));
vi.mock("@/lib/auth", () => ({ getSessionFromRequest: vi.fn() }));

const { getSessionFromRequest } = await import("@/lib/auth");

describe("admin backend status api", () => {
  it("denies unauthenticated", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValue(null as never);
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(401);
  });

  it("denies when admin disabled", async () => {
    process.env.ADMIN_PANEL_ENABLED = "false";
    vi.mocked(getSessionFromRequest).mockReturnValue({ userId: "u1", email: "a@a.com" } as never);
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(403);
  });
});
