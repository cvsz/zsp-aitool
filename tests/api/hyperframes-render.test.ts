import { describe, it, expect, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST as createJob } from "@/app/api/hyperframes/render/route";
import { GET as getJob } from "@/app/api/hyperframes/render/[id]/route";
import { POST as cancelJob } from "@/app/api/hyperframes/render/[id]/cancel/route";

const state = { pendingCount: 0 };
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { count: vi.fn().mockImplementation(async () => state.pendingCount), create: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING" }), findFirst: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue({ id: "j1", status: "CANCELLED" }) }, userSetting: { findUnique: vi.fn().mockResolvedValue({ ctaStyle: "pro" }) } } }));
vi.mock("@/services/ProductService", () => ({ productService: { getById: vi.fn().mockResolvedValue({ id: "p1", title: "Lamp", price: 100, currency: "THB", affiliateUrl: "https://example.com/aff", images: [{ url: "https://example.com/item.png" }] }) } }));

describe("hyperframes render api", () => {
  it("returns 401 unauthenticated", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", body: "{}" }) as never);
    expect(res.status).toBe(401);
  });

  it("returns disabled when flag false", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "false";
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok" }) }) as never);
    expect(res.status).toBe(503);
  });

  it("status endpoint user-scoped 404", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const res = await getJob(new Request("http://localhost") as never, { params: Promise.resolve({ id: "jx" }) });
    expect(res.status).toBe(404);
  });

  it("cancel endpoint user-scoped 404", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const res = await cancelJob(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "jx" }) });
    expect(res.status).toBe(404);
  });
});


it("returns 429 when pending queue limit reached", async () => {
  vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
  process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  process.env.HYPERFRAMES_MAX_PENDING_JOBS = "1";
  state.pendingCount = 1;
  const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok" }) }) as never);
  expect(res.status).toBe(429);
  state.pendingCount = 0;
});

it("validates watermark position enum", async () => {
  vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
  process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  await expect(() => createJob(new Request("http://localhost/api/hyperframes/render", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, watermark: { text: "My Brand", position: "top-middle" } }),
  }) as never)).rejects.toThrowError(/Invalid enum value/);
});
