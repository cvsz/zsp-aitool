import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { GET as getRenderJob } from "@/app/api/hyperframes/render/[id]/route";
import { GET as downloadRender } from "@/app/api/hyperframes/render/[id]/download/route";
import { POST as createRender } from "@/app/api/hyperframes/render/route";
import { assertSafeImportUrl } from "@/lib/url-safety";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
  count: vi.fn(),
  getById: vi.fn(),
  resolveRenderArtifactPath: vi.fn(),
  openArtifactStream: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { hyperFrameRenderJob: { findFirst: mocks.findFirst, create: mocks.create, count: mocks.count } },
}));
vi.mock("@/services/ProductService", () => ({ productService: { getById: mocks.getById } }));
vi.mock("@/lib/hyperframes/render-config", () => ({
  getHyperFramesRenderConfig: () => ({ enabled: true, outputDir: "/safe/out", maxPendingJobs: 1, maxAttempts: 2, maxOutputMb: 512 }),
}));
vi.mock("@/lib/hyperframes/artifact-access", async () => {
  const actual = await vi.importActual<typeof import("@/lib/hyperframes/artifact-access")>("@/lib/hyperframes/artifact-access");
  return { ...actual, resolveRenderArtifactPath: mocks.resolveRenderArtifactPath, openArtifactStream: mocks.openArtifactStream };
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.openArtifactStream.mockReturnValue({ on() {}, pipe() {}, destroy() {} });
});

describe("hyperframes security regression suite", () => {
  it("blocks unauthenticated access", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce(null);
    const res = await getRenderJob(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(401);
  });

  it("enforces cross-user job isolation", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@a.com" });
    mocks.findFirst.mockResolvedValueOnce(null);
    const res = await getRenderJob(new Request("http://localhost") as never, { params: Promise.resolve({ id: "foreign-job" }) });
    expect(res.status).toBe(404);
  });

  it("returns generic not found and does not leak outputPath", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@a.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-3", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/private.mp4", deletedAt: null });
    mocks.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT /safe/out/private.mp4"));
    const res = await downloadRender(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-3" }) });
    const body = JSON.stringify(await res.json());
    expect(res.status).toBe(410);
    expect(body).not.toContain("/safe/out/private.mp4");
  });

  it("blocks path traversal and symlink escape", async () => {
    const { assertArtifactInsideOutputDir } = await vi.importActual<typeof import("@/lib/hyperframes/artifact-access")>("@/lib/hyperframes/artifact-access");
    expect(() => assertArtifactInsideOutputDir("/safe/out", "../../etc/passwd")).toThrow("ARTIFACT_OUTSIDE_OUTPUT_DIR");
  });

  it("sanitizes unsafe content rendering in composition output", () => {
    const built = buildHyperFrameComposition({
      productId: "p1",
      platform: "facebook",
      aspectRatio: "9:16",
      durationSeconds: 9,
      caption: "</style><script>alert(1)</script><img src=x onerror=1>",
      product: { title: "<script>x</script>", price: "1", currency: "THB", imageUrl: "https://example.com/a.jpg", affiliateUrl: null },
    });
    expect(built.compositionHtml).not.toMatch(/<script/i);
    expect(built.compositionHtml).toContain("&lt;img src=x onerror=1&gt;");
  });

  it("blocks SSRF-style private network asset ingestion", async () => {
    await expect(assertSafeImportUrl("http://127.0.0.1/internal")).rejects.toThrow(/Private or local network URLs are not allowed/);
    await expect(assertSafeImportUrl("http://localhost/admin")).rejects.toThrow(/Private or local network URLs are not allowed/);
  });

  it("keeps queue-limit quota enforcement to prevent bypass", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@a.com" });
    mocks.count.mockResolvedValueOnce(1);
    const res = await createRender(new Request("http://localhost", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 10, caption: "ok" }) }) as never);
    expect(res.status).toBe(429);
  });

  it("blocks retry abuse after max attempts", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@a.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-5", status: "FAILED", attempts: 2, durationSeconds: 10, width: 1080, height: 1920, createdAt: new Date(), startedAt: null, completedAt: null, failedAt: new Date(), errorMessage: null, compositionMetadata: {}, outputPath: null });
    const res = await getRenderJob(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-5" }) });
    const body = await res.json();
    expect(body.data.canRetry).toBe(false);
  });

  it("prevents public/signed token tamper by requiring auth on download", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce(null);
    const tampered = new Request("http://localhost/api/hyperframes/render/job-1/download?token=forged&signature=bad");
    const res = await downloadRender(tampered as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(401);
  });

  it("keeps CSV formula injection protections covered", async () => {
    const { toCsv } = await import("@/lib/csv");
    const csv = toCsv([{ payload: "=SUM(A1:A2)" }, { payload: "+cmd" }]);
    expect(csv).toContain("'=SUM(A1:A2)");
    expect(csv).toContain("'+cmd");
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi, beforeEach } from "vitest";

import * as auth from "@/lib/auth";
import { POST as createRenderJob } from "@/app/api/hyperframes/render/route";
import { GET as getRenderJob } from "@/app/api/hyperframes/render/[id]/route";
import { GET as downloadRender } from "@/app/api/hyperframes/render/[id]/download/route";
import { POST as compose } from "@/app/api/hyperframes/compose/route";

const state = vi.hoisted(() => ({ pendingCount: 0 }));

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  count: vi.fn().mockImplementation(async () => state.pendingCount),
  create: vi.fn().mockResolvedValue({ id: "job-1", status: "PENDING" }),
  resolveRenderArtifactPath: vi.fn(),
  openArtifactStream: vi.fn(() => ({ on() {}, pipe() {}, destroy() {} })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { hyperFrameRenderJob: { findFirst: mocks.findFirst, count: mocks.count, create: mocks.create } },
}));

vi.mock("@/lib/hyperframes/render-config", () => ({
  getHyperFramesRenderConfig: () => ({ enabled: true, outputDir: "/safe/out", maxOutputMb: 512, maxPendingJobs: 1, maxAttempts: 2 }),
}));

vi.mock("@/lib/hyperframes/artifact-access", () => ({
  resolveRenderArtifactPath: mocks.resolveRenderArtifactPath,
  getArtifactContentType: vi.fn().mockReturnValue("video/mp4"),
  buildSafeArtifactFilename: vi.fn().mockReturnValue("hyperframes-render-job-1.mp4"),
  openArtifactStream: mocks.openArtifactStream,
}));

vi.mock("@/services/ProductService", () => ({
  productService: {
    getById: vi.fn().mockResolvedValue({
      id: "p1", title: "สินค้า", price: 199, currency: "THB", affiliateUrl: "https://example.com/aff", images: [{ url: "https://cdn.example.com/image.jpg" }],
    }),
  },
}));

describe("hyperframes security regression suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.pendingCount = 0;
  });

  it("blocks unauthenticated render enqueue", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await createRenderJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", body: "{}" }) as never);
    expect(res.status).toBe(401);
  });

  it("prevents cross-user job status access", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u1@example.com" });
    mocks.findFirst.mockResolvedValueOnce(null);
    const res = await getRenderJob(new Request("http://localhost") as never, { params: Promise.resolve({ id: "other-user-job" }) });
    expect(res.status).toBe(404);
  });

  it("blocks traversal and symlink-style artifact escape", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u1@example.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-escape", userId: "u1", status: "COMPLETED", outputPath: "../../etc/passwd", deletedAt: null });
    mocks.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ARTIFACT_OUTSIDE_OUTPUT_DIR"));
    const res = await downloadRender(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-escape" }) });
    expect(res.status).toBe(410);
  });

  it("does not leak outputPath when artifact is missing", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u1@example.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-2", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-2.mp4", deletedAt: null });
    mocks.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT"));
    const res = await downloadRender(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-2" }) });
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain("/safe/out/");
  });

  it("keeps unsafe content rendering and SSRF URL filtering covered", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u1@example.com" });
    const sanitizeTests = readFileSync(join(process.cwd(), "tests/hyperframes-sanitize.test.ts"), "utf8");
    expect(sanitizeTests).toContain("rejects unsafe URL schemes and obfuscation");

    const res = await compose(new Request("http://localhost/api/hyperframes/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 12, caption: "ok" }),
    }) as never);

    expect(res.status).toBe(200);
  });

  it("enforces queue limit against retry abuse and quota bypass", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u1@example.com" });
    state.pendingCount = 1;
    const res = await createRenderJob(new Request("http://localhost/api/hyperframes/render", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 10, caption: "ok" }),
    }) as never);
    expect(res.status).toBe(429);
  });

  it("keeps public share/signed download tamper surface absent and CSV injection checks present", () => {
    const downloadRoute = readFileSync(join(process.cwd(), "src/app/api/hyperframes/render/[id]/download/route.ts"), "utf8");
    expect(downloadRoute).not.toMatch(/token=/i);
    expect(downloadRoute).not.toMatch(/signature/i);

    const csvTests = readFileSync(join(process.cwd(), "tests/export-panel-security.test.ts"), "utf8");
    expect(csvTests).toContain("dangerouslySetInnerHTML");
    expect(csvTests).toContain("innerHTML");
  });
});
