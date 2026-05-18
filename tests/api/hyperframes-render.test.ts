import { beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST as createJob } from "@/app/api/hyperframes/render/route";
import { POST as retryJob } from "@/app/api/hyperframes/render/[id]/retry/route";

const state = { pendingCount: 0, monthCount: 0, runningCount: 0, existingJobUser: "u1" };
import { GET as getJob } from "@/app/api/hyperframes/render/[id]/route";
import { POST as cancelJob } from "@/app/api/hyperframes/render/[id]/cancel/route";
import { productService } from "@/services/ProductService";

const state = { pendingCount: 0, dailyCount: 0 };
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { count: vi.fn().mockImplementation(async ({ where }: { where?: { status?: string; userId?: string } }) => where?.status === "PENDING" ? state.pendingCount : state.dailyCount), create: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING" }), findFirst: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue({ id: "j1", status: "CANCELLED" }) } } }));
const quotaMocks = vi.hoisted(() => ({ enforceBeforeEnqueue: vi.fn().mockResolvedValue({ allowed: true, summary: { remainingMonthlyRenders: 10, storageUsedMb: 0, storageQuotaMb: 1024, retentionDays: 14 } }) }));
vi.mock("@/services/HyperFramesQuotaService", () => ({ HyperFramesQuotaService: { enforceBeforeEnqueue: quotaMocks.enforceBeforeEnqueue } }));

const state = { pendingCount: 0 };
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { count: vi.fn().mockImplementation(async () => state.pendingCount), create: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING" }), findFirst: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue({ id: "j1", status: "CANCELLED" }) }, userSetting: { findUnique: vi.fn().mockResolvedValue({ ctaStyle: "pro" }) } } }));
vi.mock("@/services/ProductService", () => ({ productService: { getById: vi.fn().mockResolvedValue({ id: "p1", title: "Lamp", price: 100, currency: "THB", affiliateUrl: "https://example.com/aff", images: [{ url: "https://example.com/item.png" }] }) } }));
const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING" }),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { count: vi.fn().mockImplementation(async () => state.pendingCount), create: createMock, findFirst: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue({ id: "j1", status: "CANCELLED" }) } } }));

vi.mock("@/services/ProductService", () => ({
  productService: { getById: vi.fn().mockResolvedValue({ id: "p1", title: "Demo", price: 120, currency: "THB", images: [], affiliateUrl: null }) }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userSetting: { findUnique: vi.fn().mockResolvedValue({ subscriptionPlan: "FREE" }) },
    hyperFrameRenderJob: {
      count: vi.fn().mockImplementation(async (args: { where?: { createdAt?: unknown; status?: { in?: string[] } } }) => {
        if (args?.where?.createdAt) return state.monthCount;
        if (args?.where?.status && typeof args.where.status === "object" && "in" in args.where.status) return state.runningCount;
        return state.pendingCount;
      }),
      create: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING" }),
      findFirst: vi.fn().mockImplementation(async ({ where }: { where: { userId: string } }) => where.userId === state.existingJobUser ? { id: "j1", userId: where.userId, status: "FAILED", durationSeconds: 10 } : null),
      update: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING" })
    }
  }
}));

describe("hyperframes render api subscription limits", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_MAX_PENDING_JOBS = "10";
    state.pendingCount = 0;
    state.monthCount = 0;
    state.runningCount = 0;
    state.existingJobUser = "u1";
  });

  it("enforces free limits", async () => {
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 16, caption: "ok" }) }) as never);
    expect(res.status).toBe(402);
  it("TTS disabled by default", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    delete process.env.HYPERFRAMES_TTS_ENABLED;
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok", voiceover: { source: "upload", mimeType: "audio/mpeg", sizeBytes: 2048, durationSeconds: 8 } }) }) as never);
    expect(res.status).toBe(403);
  it("rejects arbitrary compositionHtml payload", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    await expect(createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok", compositionHtml: "<script>alert(1)</script>" }) }) as never)).rejects.toBeTruthy();
  });

  it("status endpoint user-scoped 404", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const res = await getJob(new Request("http://localhost") as never, { params: Promise.resolve({ id: "jx" }) });
    expect(res.status).toBe(404);
  });

  it("allows higher pro duration", async () => {
    const prismaMod = await import("@/lib/prisma");
    vi.mocked(prismaMod.prisma.userSetting.findUnique).mockResolvedValueOnce({ subscriptionPlan: "PRO" } as never);
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 30, caption: "ok" }) }) as never);
    expect(res.status).toBe(200);
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

  it("blocks enqueue when monthly quota exceeded", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    quotaMocks.enforceBeforeEnqueue.mockResolvedValueOnce({ allowed: false, code: "MONTHLY_QUOTA_EXCEEDED", message: "Monthly render quota exceeded", summary: { remainingMonthlyRenders: 0, storageUsedMb: 32, storageQuotaMb: 1024, retentionDays: 14 } });
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok" }) }) as never);
    const body = await res.json();
    expect(res.status).toBe(429);
    expect(body.data.remainingMonthlyRenders).toBe(0);
  });
});

it("persists safe voiceover metadata", async () => {
  vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
  vi.spyOn(productService, "getById").mockResolvedValue({ id: "p1", title: "title", price: 10, currency: "THB", images: [{ url: "https://example.com/p.png" }], affiliateUrl: null } as never);
  process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  process.env.HYPERFRAMES_TTS_ENABLED = "true";
  await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 12, caption: "ok", voiceover: { source: "cached", mimeType: "audio/mpeg", sizeBytes: 2048, durationSeconds: 8, url: "/api/hyperframes/audio/cache-1.mp3" } }) }) as never);
  expect(createMock).toHaveBeenCalled();
  const metadata = createMock.mock.calls.at(-1)?.[0]?.data?.compositionMetadata as { voiceover?: { url?: string } };
  expect(metadata.voiceover?.url).toBe("/api/hyperframes/audio/cache-1.mp3");
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

  it("returns controlled 429 for concurrency limit", async () => {
    state.runningCount = 1;
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok" }) }) as never);
    expect(res.status).toBe(429);
  });

  it("no cross-user leakage on retry", async () => {
    state.existingJobUser = "u-other";
    const res = await retryJob(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    expect(res.status).toBe(404);
  });
it("blocks paid features for unpaid plan", async () => {
  vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
  process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  state.pendingCount = 0;
  const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json", "x-plan": "free", "x-hf-quota-remaining": "5" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 20, caption: "ok", highQuality: true }) }) as never);
  expect(res.status).toBe(402);
});

it("blocks when paid quota exceeded", async () => {
  vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
  process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  state.pendingCount = 0;
  const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json", "x-plan": "pro", "x-hf-quota-remaining": "0" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 20, caption: "ok", removeWatermark: true }) }) as never);
  expect(res.status).toBe(429);
});
