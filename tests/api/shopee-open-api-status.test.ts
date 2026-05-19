import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/integrations/shopee/status/route";
import { getSessionFromRequest } from "@/lib/auth";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getSessionFromRequest: vi.fn(() => null) };
});

describe("Shopee Open API status route", () => {
  it("requires auth", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const res = await GET(new NextRequest("http://localhost/api/integrations/shopee/status") as never);
    expect(res.status).toBe(401);
  });

  it("does not expose secrets", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u1@example.com" });
    const res = await GET(new NextRequest("http://localhost/api/integrations/shopee/status") as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).not.toMatch(/partner_key|webhook_secret|access_token|refresh_token/i);
  });
});
