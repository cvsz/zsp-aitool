import { describe, it, expect, vi, beforeEach } from "vitest";
import * as auth from "@/lib/auth";
import { POST as createJob } from "@/app/api/hyperframes/render/route";

const state = { pendingCount: 0, usage: 0, createCalled: false };

vi.mock("@/services/ProductService", () => ({ productService: { getById: vi.fn().mockResolvedValue({ id: "p1", title: "P", price: 10, currency: "THB", images: [] }) } }));
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { count: vi.fn().mockImplementation(async (args?: { where?: { status?: string } }) => args?.where?.status ? state.pendingCount : state.usage), create: vi.fn().mockImplementation(async () => { state.createCalled = true; return { id: "j1", status: "PENDING" }; }) } } }));

describe("hyperframes billing gates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u1@test.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_BILLING_PLAN = "free";
    process.env.HYPERFRAMES_MONTHLY_QUOTA = "10";
    state.pendingCount = 0;
    state.usage = 0;
    state.createCalled = false;
  });

  it("blocks unpaid plan premium options", async () => {
    const res = await createJob(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, quality: "high" }) }) as never);
    expect(res.status).toBe(402);
  });

  it("blocks when quota exceeded", async () => {
    state.usage = 10;
    const res = await createJob(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 }) }) as never);
    expect(res.status).toBe(402);
  });

  it("allows when plan/quota are valid", async () => {
    process.env.HYPERFRAMES_BILLING_PLAN = "pro";
    const res = await createJob(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 30, quality: "high", batchSize: 3, removeWatermark: true }) }) as never);
    expect(res.status).toBe(200);
    expect(state.createCalled).toBe(true);
  });
});
