import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/products/route";
import { getSessionFromRequest } from "@/lib/auth";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getSessionFromRequest: vi.fn(() => null) };
});

describe("products route", () => {
  it("requires authentication", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const response = await GET(new NextRequest("http://localhost/api/products"));
    expect(response.status).toBe(401);
  });
});
