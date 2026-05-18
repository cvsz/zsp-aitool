import { beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST } from "@/app/api/hyperframes/social-export/route";

const state = { findJob: { id: "j1" } as { id: string } | null, lastAudit: null as null | Record<string, unknown> };

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      findFirst: vi.fn().mockImplementation(async () => state.findJob),
    },
    aPIUsageLog: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        state.lastAudit = data;
        return { id: "audit1" };
      }),
    },
  },
}));

describe("hyperframes social export api", () => {
  beforeEach(() => {
    state.findJob = { id: "j1" };
    state.lastAudit = null;
    process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED = "true";
    vi.restoreAllMocks();
  });

  it("disabled by default", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@x.com" });
    delete process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED;
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "j1", provider: "tiktok", confirm: true }) }) as never);
    expect(res.status).toBe(503);
  });

  it("unauth blocked", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", body: "{}" }) as never);
    expect(res.status).toBe(401);
  });

  it("explicit confirmation required", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@x.com" });
    await expect(POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "j1", provider: "tiktok", confirm: false }) }) as never)).rejects.toBeTruthy();
  });

  it("writes audit event without credentials", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@x.com" });
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "j1", provider: "reels", confirm: true, note: "manual push" }) }) as never);
    expect(res.status).toBe(200);
    expect(state.lastAudit).toBeTruthy();
    const serialized = JSON.stringify(state.lastAudit);
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("secret");
  });
});
