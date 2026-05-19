import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { POST as createJob } from "@/app/api/hyperframes/render/route";

const mocks = vi.hoisted(() => ({
  state: { planTier: "FREE", monthCount: 0, runningCount: 0, globalPending: 0, createCalled: false },
}));

vi.mock("@/services/ProductService", () => ({ productService: { getById: vi.fn().mockResolvedValue({ id: "p1", title: "P", price: 10, currency: "THB", images: [] }) } }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn().mockImplementation(async () => ({ planTier: mocks.state.planTier })) },
    userSetting: { findUnique: vi.fn().mockResolvedValue(null) },
    hyperFrameRenderJob: {
      count: vi.fn().mockImplementation(async ({ where }: any = {}) => {
        if (where?.createdAt) return mocks.state.monthCount;
        if (where?.status && typeof where.status === "object") return mocks.state.runningCount;
        if (where?.userId) return mocks.state.monthCount;
        return mocks.state.globalPending;
      }),
      aggregate: vi.fn().mockResolvedValue({ _sum: { outputSizeBytes: 0 } }),
      create: vi.fn().mockImplementation(async () => { mocks.state.createCalled = true; return { id: "j1", status: "PENDING", orgId: null }; }),
    },
  },
}));
vi.mock("@/services/HyperFramesQuotaService", () => ({ HyperFramesQuotaService: { enforceBeforeEnqueue: vi.fn().mockResolvedValue({ allowed: true, summary: { remainingMonthlyRenders: 10, storageUsedMb: 0, storageQuotaMb: 1024, retentionDays: 14 } }) } }));

describe("hyperframes billing gates", () => {
  beforeEach(() => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u1@test.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_MAX_PENDING_JOBS = "10";
    mocks.state.planTier = "FREE";
    mocks.state.monthCount = 0;
    mocks.state.runningCount = 0;
    mocks.state.globalPending = 0;
    mocks.state.createCalled = false;
  });

  it("blocks unpaid plan long renders", async () => {
    const res = await createJob(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 30 }) }) as never);
    expect(res.status).toBe(402);
  });

  it("blocks when plan quota is exceeded", async () => {
    mocks.state.monthCount = 10;
    const res = await createJob(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 }) }) as never);
    expect(res.status).toBe(402);
  });

  it("allows when plan and quota are valid", async () => {
    mocks.state.planTier = "PRO";
    const res = await createJob(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 30, qualityProfile: "standard" }) }) as never);
    expect(res.status).toBe(200);
    expect(mocks.state.createCalled).toBe(true);
  });
});
