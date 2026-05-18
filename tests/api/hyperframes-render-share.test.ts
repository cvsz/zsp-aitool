import { beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST, DELETE } from "@/app/api/hyperframes/render/[id]/share/route";
import { GET } from "@/app/api/hyperframes/render/share/[token]/route";

const m = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
  findUnique: vi.fn(),
  resolveRenderArtifactPath: vi.fn(),
  openArtifactStream: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { findFirst: m.findFirst }, hyperFrameRenderShare: { create: m.create, updateMany: m.updateMany, findUnique: m.findUnique } } }));
vi.mock("@/lib/hyperframes/render-config", () => ({ getHyperFramesRenderConfig: () => ({ shareEnabled: true, outputDir: "/safe/out", maxOutputMb: 512 }) }));
vi.mock("@/lib/hyperframes/artifact-access", () => ({
  resolveRenderArtifactPath: m.resolveRenderArtifactPath,
  getArtifactContentType: vi.fn().mockReturnValue("video/mp4"),
  buildSafeArtifactFilename: vi.fn().mockReturnValue("render.mp4"),
  openArtifactStream: m.openArtifactStream,
}));

beforeEach(() => {
  vi.clearAllMocks();
  m.openArtifactStream.mockReturnValue({ on() {}, pipe() {}, destroy() {} });
});

describe("hyperframes render share", () => {
  it("share disabled by default", async () => {
    vi.doMock("@/lib/hyperframes/render-config", () => ({ getHyperFramesRenderConfig: () => ({ shareEnabled: false }) }));
    const { POST: disabledPost } = await import("@/app/api/hyperframes/render/[id]/share/route");
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    const res = await disabledPost(new Request("http://localhost", { method: "POST", body: "{}" }) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(404);
  });

  it("owner creates share", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    m.findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/a.mp4" });
    m.create.mockResolvedValueOnce({ id: "s1" });
    const res = await POST(new Request("http://localhost", { method: "POST", body: JSON.stringify({ expiresInSeconds: 120 }) }) as never, { params: Promise.resolve({ id: "job-1" }) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.url).toContain("/api/hyperframes/render/share/");
  });

  it("cross-user cannot create", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u2", email: "b@b.com" });
    m.findFirst.mockResolvedValueOnce(null);
    const res = await POST(new Request("http://localhost", { method: "POST", body: "{}" }) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(404);
  });

  it("expired token rejected", async () => {
    m.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() - 1000), revokedAt: null, renderJob: { id: "job-1", status: "COMPLETED", outputPath: "/safe/out/a.mp4" } });
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    expect(res.status).toBe(410);
  });

  it("revoked token rejected", async () => {
    m.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 1000), revokedAt: new Date(), renderJob: { id: "job-1", status: "COMPLETED", outputPath: "/safe/out/a.mp4" } });
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    expect(res.status).toBe(410);
  });

  it("no outputPath exposure", async () => {
    m.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 1000), revokedAt: null, renderJob: { id: "job-1", status: "COMPLETED", outputPath: "/safe/out/private.mp4" } });
    m.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT /safe/out/private.mp4"));
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(JSON.stringify(body)).not.toContain("/safe/out/private.mp4");
  });

  it("owner revoke", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    m.updateMany.mockResolvedValueOnce({ count: 1 });
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(200);
  });
});
