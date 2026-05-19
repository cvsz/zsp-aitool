import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { POST } from "@/app/api/hyperframes/social-export/route";

const mocks = vi.hoisted(() => ({
  state: { findJob: { id: "j1" } as { id: string } | null, lastAudit: null as null | Record<string, unknown> },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: { findFirst: vi.fn().mockImplementation(async () => mocks.state.findJob) },
    hyperFrameSocialExportAuditEvent: { create: vi.fn().mockImplementation(async ({ data }) => { mocks.state.lastAudit = data; return { id: "audit1" }; }) },
  },
}));

describe("hyperframes social export api", () => {
  beforeEach(() => {
    mocks.state.findJob = { id: "j1" };
    mocks.state.lastAudit = null;
    process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED = "true";
    vi.restoreAllMocks();
  });

  it("is disabled by default", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@x.com" });
    delete process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED;
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "j1", provider: "tiktok", confirm: true }) }) as never);
    expect(res.status).toBe(503);
  });

  it("blocks unauthenticated requests", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", body: "{}" }) as never);
    expect(res.status).toBe(401);
  });

  it("requires explicit confirmation", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@x.com" });
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "j1", provider: "tiktok", confirm: false }) }) as never);
    expect(res.status).toBe(400);
  });

  it("writes audit event without credentials and never auto posts", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@x.com" });
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "j1", provider: "reels", confirm: true, notes: "manual push" }) }) as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.autoPosted).toBe(false);
    expect(mocks.state.lastAudit).toMatchObject({ userId: "u1" });
    expect(JSON.stringify(body)).not.toMatch(/token|secret|password|credential/i);
  });
});
