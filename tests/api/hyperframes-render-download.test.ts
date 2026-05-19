import { Readable } from "node:stream";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as auth from "@/lib/auth";
import { GET, HEAD } from "@/app/api/hyperframes/render/[id]/download/route";

const { findFirst, resolveRenderArtifactPath, openArtifactStream } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  resolveRenderArtifactPath: vi.fn(),
  openArtifactStream: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { findFirst } } }));
vi.mock("@/lib/hyperframes/render-config", () => ({ getHyperFramesRenderConfig: () => ({ outputDir: "/safe/out", maxOutputMb: 512 }) }));
vi.mock("@/lib/hyperframes/artifact-access", () => ({
  resolveRenderArtifactPath,
  getArtifactContentType: vi.fn().mockReturnValue("video/mp4"),
  buildSafeArtifactFilename: vi.fn().mockReturnValue("hyperframes-render-job-1.mp4"),
  openArtifactStream,
}));

describe("hyperframes render download api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    openArtifactStream.mockReturnValue(Readable.from([Buffer.from("ok")]));
  });

  it("returns 401 unauthenticated", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce(null);
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 for cross-user or missing job", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce(null);
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-x" }) });
    expect(res.status).toBe(404);
  });

  it("downloads completed render with secure headers", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-1.mp4", deletedAt: null });
    resolveRenderArtifactPath.mockResolvedValueOnce("/safe/out/job-1.mp4");
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("video/mp4");
    expect(res.headers.get("content-disposition")).toContain("hyperframes-render-job-1.mp4");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("blocks non-completed statuses", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-2", userId: "u1", status: "RUNNING", outputPath: "/safe/out/job-2.mp4", deletedAt: null });
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-2" }) });
    expect(res.status).toBe(409);
  });

  it("returns 404 for missing output file without leaking local path", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-3", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-3.mp4", deletedAt: null });
    resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT"));
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-3" }) });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(JSON.stringify(body)).not.toContain("/safe/out/");
  });

  it("blocks traversal/symlink escape as gone", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-4", userId: "u1", status: "COMPLETED", outputPath: "../../etc/passwd", deletedAt: null });
    resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ARTIFACT_OUTSIDE_OUTPUT_DIR"));
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-4" }) });
    expect(res.status).toBe(410);
  });

  it("HEAD returns headers without body", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-1.mp4", deletedAt: null });
    resolveRenderArtifactPath.mockResolvedValueOnce("/safe/out/job-1.mp4");
    const res = await HEAD(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("");
  });
});
