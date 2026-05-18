import { beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST as createJob } from "@/app/api/hyperframes/render/route";
import { POST as retryJob } from "@/app/api/hyperframes/render/[id]/retry/route";

const state = { pendingCount: 0, monthCount: 0, runningCount: 0, existingJobUser: "u1" };

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
  });

  it("allows higher pro duration", async () => {
    const prismaMod = await import("@/lib/prisma");
    vi.mocked(prismaMod.prisma.userSetting.findUnique).mockResolvedValueOnce({ subscriptionPlan: "PRO" } as never);
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 30, caption: "ok" }) }) as never);
    expect(res.status).toBe(200);
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
});
