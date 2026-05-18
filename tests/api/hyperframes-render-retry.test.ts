import { describe, it, expect, vi, beforeEach } from "vitest";
import * as auth from "@/lib/auth";
import { POST as retryPost } from "@/app/api/hyperframes/render/[id]/retry/route";

const state = {
  pendingCount: 0,
  findFirstResult: null as null | { id: string; userId: string; status: "FAILED" | "CANCELLED" | "COMPLETED" | "RUNNING" | "PENDING"; attempts: number; outputPath: string | null; productId: string | null; compositionHtml: string; compositionMetadata: Record<string, unknown> },
};

const { updateMock } = vi.hoisted(() => ({ updateMock: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING", attempts: 1 }) }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      findFirst: vi.fn().mockImplementation(async () => state.findFirstResult),
      count: vi.fn().mockImplementation(async () => state.pendingCount),
      update: updateMock,
    },
  },
}));

describe("hyperframes retry api", () => {
  beforeEach(() => {
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_MAX_PENDING_JOBS = "5";
    process.env.HYPERFRAMES_MAX_ATTEMPTS = "3";
    state.pendingCount = 0;
    state.findFirstResult = null;
    updateMock.mockClear();
  });

  it("unauthenticated retry returns 401", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce(null);
    const res = await retryPost(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    expect(res.status).toBe(401);
  });

  it("owner can retry FAILED", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@test.com" });
    state.findFirstResult = { id: "j1", userId: "u1", status: "FAILED", attempts: 1, outputPath: "/var/lib/zsp-aitool/hyperframes/renders/a.mp4", productId: "p1", compositionHtml: "<html />", compositionMetadata: { platform: "facebook" } };
    const res = await retryPost(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(JSON.stringify(body)).not.toContain("outputPath");
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "PENDING", errorMessage: null, failedAt: null, completedAt: null, startedAt: null, lockedAt: null, lockedBy: null }) }));
  });

  it("owner can retry CANCELLED", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@test.com" });
    state.findFirstResult = { id: "j1", userId: "u1", status: "CANCELLED", attempts: 0, outputPath: null, productId: "p1", compositionHtml: "<html />", compositionMetadata: { platform: "facebook" } };
    const res = await retryPost(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    expect(res.status).toBe(200);
  });

  it("cross-user retry returns 404", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@test.com" });
    state.findFirstResult = null;
    const res = await retryPost(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "j2" }) });
    expect(res.status).toBe(404);
  });

  it("COMPLETED/RUNNING/PENDING blocked", async () => {
    for (const status of ["COMPLETED", "RUNNING", "PENDING"] as const) {
      vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@test.com" });
      state.findFirstResult = { id: "j1", userId: "u1", status, attempts: 1, outputPath: null, productId: "p1", compositionHtml: "<html />", compositionMetadata: {} };
      const res = await retryPost(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
      expect(res.status).toBe(409);
    }
  });

  it("max attempts blocked", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@test.com" });
    state.findFirstResult = { id: "j1", userId: "u1", status: "FAILED", attempts: 3, outputPath: null, productId: "p1", compositionHtml: "<html />", compositionMetadata: {} };
    const res = await retryPost(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    expect(res.status).toBe(409);
  });

  it("queue limit blocked", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@test.com" });
    process.env.HYPERFRAMES_MAX_PENDING_JOBS = "1";
    state.pendingCount = 1;
    state.findFirstResult = { id: "j1", userId: "u1", status: "FAILED", attempts: 1, outputPath: null, productId: "p1", compositionHtml: "<html />", compositionMetadata: {} };
    const res = await retryPost(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    expect(res.status).toBe(429);
  });
});
