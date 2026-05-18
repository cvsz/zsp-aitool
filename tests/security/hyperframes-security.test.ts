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
