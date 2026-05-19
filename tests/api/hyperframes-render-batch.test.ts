import { beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST as batchPost } from "@/app/api/hyperframes/render/batch/route";

const state = { globalPending: 0, userPending: 0, created: 0 };

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      count: vi.fn().mockImplementation(async ({ where }: any) => (where?.userId ? state.userPending : state.globalPending)),
      create: vi.fn().mockImplementation(async () => ({ id: `j${++state.created}`, status: "PENDING" })),
    },
  },
}));

vi.mock("@/services/ProductService", () => ({
  productService: {
    getById: vi.fn(async (userId: string, id: string) => {
      if (id === "forbidden" || userId !== "u1") {
        const { AppError } = await import("@/lib/errors");
        throw new AppError("NOT_FOUND", "Product not found", 404);
      }
      return { id, title: "P", price: 10, currency: "THB", affiliateUrl: "https://aff", images: [] };
    }),
  },
}));

describe("hyperframes batch render api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    state.globalPending = 0;
    state.userPending = 0;
    state.created = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_MAX_BATCH_SIZE = "2";
    process.env.HYPERFRAMES_MAX_PENDING_JOBS = "3";
    process.env.HYPERFRAMES_MAX_PENDING_PER_USER = "2";
  });

  it("blocks unauthenticated", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await batchPost(new Request("http://localhost/api/hyperframes/render/batch", { method: "POST", body: JSON.stringify({ items: [{ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 }] }) }) as never);
    expect(res.status).toBe(401);
  });

  it("enforces max batch size", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@u.com" });
    const res = await batchPost(new Request("http://localhost/api/hyperframes/render/batch", { method: "POST", body: JSON.stringify({ items: [
      { productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 },
      { productId: "p2", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 },
      { productId: "p3", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 },
    ] }) }) as never);
    expect(res.status).toBe(400);
  });

  it("skips cross-user safely and supports partial success", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@u.com" });
    const res = await batchPost(new Request("http://localhost/api/hyperframes/render/batch", { method: "POST", body: JSON.stringify({ items: [
      { productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 },
      { productId: "forbidden", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 },
    ] }) }) as never);
    expect(res.status).toBe(207);
    const body = await res.json();
    expect(body.data.results.some((x: any) => x.productId === "forbidden" && x.status === "skipped")).toBe(true);
    expect(JSON.stringify(body)).not.toContain("/var/lib/");
  });


  it("rejects arbitrary compositionHtml items", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@u.com" });
    await expect(batchPost(new Request("http://localhost/api/hyperframes/render/batch", { method: "POST", body: JSON.stringify({ items: [{ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, compositionHtml: "<script>alert(1)</script>" }] }) }) as never)).rejects.toThrowError(/Unrecognized key/);
  });

  it("enforces global queue limit", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@u.com" });
    state.globalPending = 3;
    const res = await batchPost(new Request("http://localhost/api/hyperframes/render/batch", { method: "POST", body: JSON.stringify({ items: [{ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10 }] }) }) as never);
    const body = await res.json();
    expect(body.data.results[0].reason).toBe("queue_limit");
  });
});
