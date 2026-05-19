import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { GET as getRenderJob } from "@/app/api/hyperframes/render/[id]/route";
import { GET as downloadRender } from "@/app/api/hyperframes/render/[id]/download/route";
import { POST as createRender } from "@/app/api/hyperframes/render/route";
import { assertSafeImportUrl } from "@/lib/url-safety";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { toCsv } from "@/lib/csv";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
  count: vi.fn(),
  aggregate: vi.fn(),
  getById: vi.fn(),
  resolveRenderArtifactPath: vi.fn(),
  openArtifactStream: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn().mockResolvedValue({ planTier: "FREE" }) },
    userSetting: { findUnique: vi.fn().mockResolvedValue(null) },
    hyperFrameRenderJob: { findFirst: mocks.findFirst, create: mocks.create, count: mocks.count, aggregate: mocks.aggregate },
  },
}));
vi.mock("@/services/ProductService", () => ({ productService: { getById: mocks.getById } }));
vi.mock("@/services/HyperFramesQuotaService", () => ({ HyperFramesQuotaService: { enforceBeforeEnqueue: vi.fn().mockResolvedValue({ allowed: true, summary: { remainingMonthlyRenders: 10, storageUsedMb: 0, storageQuotaMb: 1024, retentionDays: 14 } }) } }));
vi.mock("@/lib/hyperframes/render-config", () => ({ getHyperFramesRenderConfig: () => ({ enabled: true, outputDir: "/safe/out", maxPendingJobs: 1, maxAttempts: 2, maxOutputMb: 512, allowedQualityProfiles: "preview,standard", highQualityEnabled: false, maxDurationSeconds: 60 }) }));
vi.mock("@/lib/hyperframes/artifact-access", async () => {
  const actual = await vi.importActual<typeof import("@/lib/hyperframes/artifact-access")>("@/lib/hyperframes/artifact-access");
  return { ...actual, resolveRenderArtifactPath: mocks.resolveRenderArtifactPath, openArtifactStream: mocks.openArtifactStream };
});

describe("hyperframes security regression suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.count.mockResolvedValue(0);
    mocks.aggregate.mockResolvedValue({ _sum: { outputSizeBytes: 0 } });
    mocks.create.mockResolvedValue({ id: "job-1", status: "PENDING", orgId: null });
    mocks.getById.mockResolvedValue({ id: "p1", title: "Demo", price: 1, currency: "THB", images: [], affiliateUrl: null });
    mocks.openArtifactStream.mockReturnValue(Readable.from([Buffer.from("ok")]));
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  });

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


  it("returns generic not found and does not leak output paths", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@a.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-3", userId: "u1", orgId: null, status: "COMPLETED", outputPath: "/safe/out/private.mp4", deletedAt: null });
    mocks.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT /safe/out/private.mp4"));
    const res = await downloadRender(new Request("http://localhost/api/hyperframes/render/job-3/download") as never, { params: Promise.resolve({ id: "job-3" }) });
    const body = JSON.stringify(await res.json());
    expect(res.status).toBe(410);
    expect(body).not.toContain("/safe/out/private.mp4");
  });

  it("blocks path traversal and symlink escape", async () => {
    const { assertArtifactInsideOutputDir } = await vi.importActual<typeof import("@/lib/hyperframes/artifact-access")>("@/lib/hyperframes/artifact-access");
    expect(() => assertArtifactInsideOutputDir("/safe/out", "../../etc/passwd")).toThrow("ARTIFACT_OUTSIDE_OUTPUT_DIR");
  });

  it("sanitizes generated composition output and rejects raw compositionHtml", async () => {
    const built = buildHyperFrameComposition({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 9, caption: "</style><script>alert(1)</script><img src=x onerror=1>", product: { title: "<script>x</script>", price: "1", currency: "THB", imageUrl: "https://example.com/a.jpg", affiliateUrl: null } });
    expect(built.compositionHtml).not.toMatch(/<script/i);
    expect(built.compositionHtml).toContain("&lt;img src=x onerror=1&gt;");

    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@a.com" });
    const res = await createRender(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 10, compositionHtml: "<script>alert(1)</script>" }) }) as never);
    expect(res.status).toBe(422);
  });

  it("blocks SSRF-style private network asset ingestion", async () => {
    await expect(assertSafeImportUrl("http://127.0.0.1/internal")).rejects.toThrow(/Private or local network URLs are not allowed/);
    await expect(assertSafeImportUrl("http://localhost/admin")).rejects.toThrow(/Private or local network URLs are not allowed/);
  });

  it("keeps queue-limit enforcement", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@a.com" });
    mocks.count.mockResolvedValueOnce(1);
    const res = await createRender(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 10, caption: "ok" }) }) as never);
    expect(res.status).toBe(429);
  });

  it("keeps CSV formula injection protections covered", () => {
    const csv = toCsv([{ title: "=cmd|'/C calc'!A0" }], ["title"]);
    expect(csv).toContain("'=cmd");
  });
});
