import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as registerPost } from "@/app/api/auth/register/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as meGet } from "@/app/api/auth/me/route";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { clearSessionCookie, createSessionToken, setSessionCookie, getSessionFromRequest } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: vi.fn(), create: vi.fn() } } }));
vi.mock("@/lib/password", () => ({ verifyPassword: vi.fn(), hashPassword: vi.fn(async () => "h") }));
vi.mock("@/lib/rate-limit", () => ({ applyRateLimit: vi.fn(async () => ({ allowed: true })), createRateLimitKey: vi.fn(() => "k") }));
vi.mock("@/lib/auth", async () => ({ ...(await vi.importActual("@/lib/auth")), createSessionToken: vi.fn(() => "t"), setSessionCookie: vi.fn(), clearSessionCookie: vi.fn(), getSessionFromRequest: vi.fn(() => null) }));

beforeEach(() => vi.clearAllMocks());

describe("auth routes", () => {
  it("login success", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: "u1", email: "a@b.com", password: "h", name: "A" } as never);
    vi.mocked(verifyPassword).mockResolvedValueOnce(true);
    const res = await loginPost(new Request("http://x", { method: "POST", body: JSON.stringify({ email: "a@b.com", password: "password" }) }));
    expect(res.status).toBe(200);
    expect(createSessionToken).toHaveBeenCalled(); expect(setSessionCookie).toHaveBeenCalled();
  });
  it("register conflict", async () => { vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: "u1" } as never); expect((await registerPost(new Request("http://x", { method: "POST", body: JSON.stringify({ email: "a@b.com", password: "password123" }) }))).status).toBe(409); });
  it("logout clears cookie", async () => { expect((await logoutPost()).status).toBe(200); expect(clearSessionCookie).toHaveBeenCalled(); });
  it("me requires auth", async () => { vi.mocked(getSessionFromRequest).mockReturnValueOnce(null); expect((await meGet(new NextRequest("http://x"))).status).toBe(401); });
});
