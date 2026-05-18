import { describe, it, expect, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST as createJob } from "@/app/api/hyperframes/render/route";
import { GET as getJob } from "@/app/api/hyperframes/render/[id]/route";
import { POST as cancelJob } from "@/app/api/hyperframes/render/[id]/cancel/route";
import { productService } from "@/services/ProductService";

const state = { pendingCount: 0 };
const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING" }),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { count: vi.fn().mockImplementation(async () => state.pendingCount), create: createMock, findFirst: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue({ id: "j1", status: "CANCELLED" }) } } }));

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

  it("TTS disabled by default", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    delete process.env.HYPERFRAMES_TTS_ENABLED;
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok", voiceover: { source: "upload", mimeType: "audio/mpeg", sizeBytes: 2048, durationSeconds: 8 } }) }) as never);
    expect(res.status).toBe(403);
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
