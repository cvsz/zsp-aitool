import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/integrations/marqeta/status/route";
import { getSessionFromRequest } from "@/lib/auth";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getSessionFromRequest: vi.fn(() => null) };
});

describe("marqeta status route", () => {
  it("requires auth", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const res = await GET(new NextRequest("http://localhost/api/integrations/marqeta/status") as never);
    expect(res.status).toBe(401);
  });
  it("never returns token fields", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u1@example.com" });
    const res = await GET(new NextRequest("http://localhost/api/integrations/marqeta/status") as never);
    const body = await res.json();
    expect(JSON.stringify(body)).not.toMatch(/application_token|admin_access_token|authorization/i);
  });
});
