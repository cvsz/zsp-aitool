import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { GET, HEAD } from "@/app/api/hyperframes/render/[id]/thumbnail/route";

const mocks = vi.hoisted(() => ({ findFirst: vi.fn(), resolveRenderArtifactPath: vi.fn(), openArtifactStream: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { findFirst: mocks.findFirst } } }));
vi.mock("@/lib/hyperframes/render-config", () => ({ getHyperFramesRenderConfig: () => ({ outputDir: "/safe/out", maxOutputMb: 512 }) }));
vi.mock("@/lib/hyperframes/artifact-access", () => ({ resolveRenderArtifactPath: mocks.resolveRenderArtifactPath, openArtifactStream: mocks.openArtifactStream }));

describe("hyperframes render thumbnail api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.openArtifactStream.mockReturnValue({ on() {}, pipe() {}, destroy() {} });
  });

  it("returns 404 for cross-user or missing job", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    mocks.findFirst.mockResolvedValueOnce(null);
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-x" }) });
    expect(res.status).toBe(404);
  });

  it("serves thumbnail for owner", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", orgId: null, status: "COMPLETED", compositionMetadata: { thumbnailName: "job-1.jpg" }, deletedAt: null });
    mocks.resolveRenderArtifactPath.mockResolvedValueOnce("/safe/out/job-1.jpg");
    const res = await HEAD(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
  });

  it("missing thumbnail is graceful without path leak", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", orgId: null, status: "COMPLETED", compositionMetadata: { thumbnailName: "job-1.jpg" }, deletedAt: null });
    mocks.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT"));
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(JSON.stringify(body)).not.toContain("/safe/out");
  });

  it("blocks traversal and symlink escapes", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-3", userId: "u1", orgId: null, status: "COMPLETED", compositionMetadata: { thumbnailName: "job-3.jpg" }, deletedAt: null });
    mocks.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ARTIFACT_OUTSIDE_OUTPUT_DIR"));
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-3" }) });
    expect(res.status).toBe(410);
  });
});
