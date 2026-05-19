import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/integrations/shopee/status/route";
import { getSessionFromRequest } from "@/lib/auth";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getSessionFromRequest: vi.fn(() => null) };
});

describe("shopee status route", () => {
  it("requires authentication", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const response = await GET(new NextRequest("http://localhost/api/integrations/shopee/status"));
    expect(response.status).toBe(401);
  });

  it("does not expose sensitive values", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u1@test.com" });
    const response = await GET(new NextRequest("http://localhost/api/integrations/shopee/status"));
    const json = await response.json();
    expect(JSON.stringify(json)).not.toContain("SHOPEE_PARTNER_KEY");
    expect(JSON.stringify(json)).not.toContain("SHOPEE_WEBHOOK_SECRET");
    expect(JSON.stringify(json)).not.toContain("access_token");
    expect(JSON.stringify(json)).not.toContain("refresh_token");
  });
});
