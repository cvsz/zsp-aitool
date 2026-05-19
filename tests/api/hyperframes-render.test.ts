import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { POST as createJob } from "@/app/api/hyperframes/render/route";
import { GET as getJob } from "@/app/api/hyperframes/render/[id]/route";
import { POST as retryJob } from "@/app/api/hyperframes/render/[id]/retry/route";

const mocks = vi.hoisted(() => ({
  state: {
    globalPendingCount: 0,
    monthlyCount: 0,
    runningCount: 0,
    planTier: "FREE",
    existingJobUser: "u1",
    quotaAllowed: true,
  },
  createMock: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING", orgId: null }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockImplementation(async () => ({ planTier: mocks.state.planTier })),
    },
    userSetting: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    hyperFrameRenderJob: {
      count: vi.fn().mockImplementation(async ({ where }: { where?: { userId?: string; createdAt?: unknown; status?: unknown } } = {}) => {
        if (where?.createdAt) return mocks.state.monthlyCount;
        if (where?.status && typeof where.status === "object") return mocks.state.runningCount;
        if (where?.userId) return mocks.state.monthlyCount;
        return mocks.state.globalPendingCount;
      }),
      aggregate: vi.fn().mockResolvedValue({ _sum: { outputSizeBytes: 0 } }),
      create: mocks.createMock,
      findFirst: vi.fn().mockImplementation(async ({ where }: { where: { id?: string; userId?: string } }) => {
        if (where.userId === mocks.state.existingJobUser) {
          return { id: where.id ?? "j1", userId: where.userId, orgId: null, status: "FAILED", attempts: 1, durationSeconds: 10, width: 1280, height: 720, createdAt: new Date(), startedAt: null, completedAt: null, failedAt: new Date(), errorMessage: null, compositionMetadata: {}, outputPath: null };
        }
        return null;
      }),
      update: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING", attempts: 1 }),
    },
  },
}));

vi.mock("@/services/ProductService", () => ({
  productService: {
    getById: vi.fn().mockResolvedValue({ id: "p1", title: "Demo", price: 120, currency: "THB", images: [], affiliateUrl: null }),
  },
}));

vi.mock("@/services/HyperFramesQuotaService", () => ({
  HyperFramesQuotaService: {
    enforceBeforeEnqueue: vi.fn().mockImplementation(async () => mocks.state.quotaAllowed
      ? { allowed: true, summary: { remainingMonthlyRenders: 10, storageUsedMb: 0, storageQuotaMb: 1024, retentionDays: 14 } }
      : { allowed: false, code: "MONTHLY_QUOTA_EXCEEDED", message: "Monthly render quota exceeded", summary: { remainingMonthlyRenders: 0, storageUsedMb: 32, storageQuotaMb: 1024, retentionDays: 14 } }),
  },
}));

describe("hyperframes render api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_MAX_PENDING_JOBS = "10";
    process.env.HYPERFRAMES_DEFAULT_ACTIVE_RENDER_LIMIT = "3";
    delete process.env.HYPERFRAMES_TTS_ENABLED;
    mocks.state.globalPendingCount = 0;
    mocks.state.monthlyCount = 0;
    mocks.state.runningCount = 0;
    mocks.state.planTier = "FREE";
    mocks.state.existingJobUser = "u1";
    mocks.state.quotaAllowed = true;
  });

  it("enforces free duration limits", async () => {
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 30, caption: "ok" }) }) as never);
    expect(res.status).toBe(402);
  });

  it("allows higher pro duration", async () => {
    mocks.state.planTier = "PRO";
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 30, caption: "ok" }) }) as never);
    expect(res.status).toBe(200);
    expect(mocks.createMock).toHaveBeenCalled();
  });

  it("rejects arbitrary compositionHtml payload with 422 contract error", async () => {
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok", compositionHtml: "<script>alert(1)</script>" }) }) as never);
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("INVALID_BODY");
  });

  it("rejects uploaded voiceover while TTS is disabled", async () => {
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok", voiceover: { source: "upload", mimeType: "audio/mpeg", sizeBytes: 2048, durationSeconds: 8 } }) }) as never);
    expect(res.status).toBe(422);
  });

  it("returns 429 when pending queue limit is reached", async () => {
    process.env.HYPERFRAMES_MAX_PENDING_JOBS = "1";
    mocks.state.globalPendingCount = 1;
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok" }) }) as never);
    expect(res.status).toBe(429);
  });

  it("blocks enqueue when monthly quota is exceeded", async () => {
    mocks.state.quotaAllowed = false;
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok" }) }) as never);
    const body = await res.json();
    expect(res.status).toBe(429);
    expect(body.data.remainingMonthlyRenders).toBe(0);
  });

  it("status endpoint is user-scoped", async () => {
    mocks.state.existingJobUser = "u-other";
    const res = await getJob(new Request("http://localhost/api/hyperframes/render/jx") as never, { params: Promise.resolve({ id: "jx" }) });
    expect(res.status).toBe(404);
  });

  it("prevents cross-user retry", async () => {
    mocks.state.existingJobUser = "u-other";
    const res = await retryJob(new Request("http://localhost/api/hyperframes/render/j1/retry", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    expect(res.status).toBe(404);
  });
});
