import { describe, it, expect, vi, beforeEach } from "vitest";
import { Readable } from "node:stream";
import * as auth from "@/lib/auth";
import { POST } from "@/app/api/hyperframes/render/[id]/download-token/route";
import { GET } from "@/app/api/hyperframes/render/[id]/download/route";

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

describe("hyperframes signed download tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    openArtifactStream.mockReturnValue(Readable.from([]));
    process.env.HYPERFRAMES_DOWNLOAD_TOKEN_SECRET = "test-secret";
    process.env.HYPERFRAMES_DOWNLOAD_TOKEN_TTL_SECONDS = "300";
    process.env.HYPERFRAMES_SIGNED_DOWNLOADS_ENABLED = "true";
  });

  it("token created for owner completed job", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-1.mp4", deletedAt: null });

    const res = await POST(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.token).toBeTypeOf("string");
    expect(body.data.downloadUrl).toContain("token=");
    expect(JSON.stringify(body)).not.toContain("/safe/out/");
  });

  it("cross-user cannot create token", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u2", email: "b@a.com" });
    findFirst.mockResolvedValueOnce(null);

    const res = await POST(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(404);
  });

  it("expired token rejected", async () => {
    process.env.HYPERFRAMES_DOWNLOAD_TOKEN_TTL_SECONDS = "1";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-1.mp4", deletedAt: null });
    const tokenRes = await POST(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    const { data } = await tokenRes.json();

    await new Promise((r) => setTimeout(r, 1100));
    const res = await GET(new Request(`http://localhost/api/hyperframes/render/job-1/download?token=${encodeURIComponent(data.token)}`) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(401);
  });

  it("tampered token rejected", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-1.mp4", deletedAt: null });
    const tokenRes = await POST(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    const { data } = await tokenRes.json();

    const res = await GET(new Request(`http://localhost/api/hyperframes/render/job-1/download?token=${encodeURIComponent(`${data.token}x`)}`) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(401);
  });

  it("disabled mode unaffected", async () => {
    process.env.HYPERFRAMES_SIGNED_DOWNLOADS_ENABLED = "false";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-1.mp4", deletedAt: null });
    const tokenRes = await POST(new Request("http://localhost") as never, { params: Promise.resolve({ id: "job-1" }) });
    const tokenBody = await tokenRes.json();

    expect(tokenBody.data.token).toBeNull();
    findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/job-1.mp4", deletedAt: null });
    resolveRenderArtifactPath.mockResolvedValueOnce("/safe/out/job-1.mp4");
    const res = await GET(new Request("http://localhost/api/hyperframes/render/job-1/download") as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(200);
  });
});
