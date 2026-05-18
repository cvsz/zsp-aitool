import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAuditMock } = vi.hoisted(() => ({ createAuditMock: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameSocialExportAuditEvent: { create: createAuditMock },
  },
}));

vi.mock("@/middleware/auth-middleware", () => ({
  withAuth: (handler: (request: Request & { auth: { userId: string } }) => Promise<Response>) => async (request: Request) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }), { status: 401, headers: { "content-type": "application/json" } });
    }
    return handler(Object.assign(request, { auth: { userId: authHeader.replace("Bearer ", "") } }));
  },
}));

import { POST } from "@/app/api/hyperframes/social-export/route";

describe("hyperframes social export api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED;
  });

  it("is disabled by default", async () => {
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { authorization: "Bearer u1", "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "job_1", provider: "tiktok", confirm: true }) }) as never);
    expect(res.status).toBe(503);
  });

  it("blocks unauthenticated requests", async () => {
    process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED = "true";
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "job_1", provider: "tiktok", confirm: true }) }) as never);
    expect(res.status).toBe(401);
  });

  it("requires explicit confirmation", async () => {
    process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED = "true";
    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { authorization: "Bearer u1", "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "job_1", provider: "tiktok", confirm: false }) }) as never);
    expect(res.status).toBe(400);
  });

  it("writes audit event and never auto posts", async () => {
    process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED = "true";
    createAuditMock.mockResolvedValueOnce({ id: "a1" });

    const res = await POST(new Request("http://localhost/api/hyperframes/social-export", { method: "POST", headers: { authorization: "Bearer u1", "content-type": "application/json" }, body: JSON.stringify({ renderJobId: "job_1", provider: "reels", confirm: true, notes: "manual push" }) }) as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.autoPosted).toBe(false);
    expect(createAuditMock).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: "u1", renderJobId: "job_1", provider: "reels", eventType: "MANUAL_EXPORT_INTENT" }) }));
    expect(JSON.stringify(body)).not.toMatch(/token|secret|password|credential/i);
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
