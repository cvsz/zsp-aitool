import { describe, it, expect, vi, beforeEach } from "vitest";
import * as auth from "@/lib/auth";
import { GET, HEAD } from "@/app/api/hyperframes/render/[id]/thumbnail/route";

const { findFirst, resolveRenderArtifactPath, openArtifactStream } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  resolveRenderArtifactPath: vi.fn(),
  openArtifactStream: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { findFirst } } }));
vi.mock("@/lib/hyperframes/render-config", () => ({ getHyperFramesRenderConfig: () => ({ outputDir: "/safe/out", maxOutputMb: 512 }) }));
vi.mock("@/lib/hyperframes/artifact-access", () => ({ resolveRenderArtifactPath, openArtifactStream }));

describe("hyperframes render thumbnail api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    openArtifactStream.mockReturnValue({ on() {}, pipe() {}, destroy() {} });
  });

  it("returns 404 for cross-user or missing job", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce(null);
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-x" }) });
    expect(res.status).toBe(404);
  });

  it("serves thumbnail for owner", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", compositionMetadata: { thumbnailName: "job-1.jpg" }, deletedAt: null });
    resolveRenderArtifactPath.mockResolvedValueOnce("/safe/out/job-1.jpg");
    const res = await HEAD(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
  });

  it("missing thumbnail graceful without path leak", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", compositionMetadata: { thumbnailName: "job-1.jpg" }, deletedAt: null });
    resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT"));
    const res = await HEAD(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(JSON.stringify(body)).not.toContain("/safe/out");
  });
});
