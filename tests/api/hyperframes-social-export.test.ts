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
  });
});
