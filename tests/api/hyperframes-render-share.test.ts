import { beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST as createShare, DELETE as revokeShare } from "@/app/api/hyperframes/render/[id]/share/route";
import { GET as publicDownload } from "@/app/api/hyperframes/share/[token]/route";

const mocks = vi.hoisted(() => ({
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

vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { findFirst: mocks.findFirst }, hyperFrameRenderShare: { create: mocks.create, updateMany: mocks.updateMany, findUnique: mocks.findUnique } } }));
vi.mock("@/lib/hyperframes/render-config", () => ({ getHyperFramesRenderConfig: () => ({ outputDir: "/safe/out", maxOutputMb: 512 }) }));
vi.mock("@/lib/hyperframes/artifact-access", () => ({ resolveRenderArtifactPath: mocks.resolveRenderArtifactPath, getArtifactContentType: () => "video/mp4", buildSafeArtifactFilename: () => "render.mp4", openArtifactStream: mocks.openArtifactStream }));

describe("hyperframes share", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED = "false";
    mocks.openArtifactStream.mockReturnValue({ on() {}, pipe() {}, destroy() {} });
  });

  it("share disabled by default", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@x.com" });
    const res = await createShare(new Request("http://localhost", { method: "POST", body: "{}" }) as never, { params: Promise.resolve({ id: "job1" }) });
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
    process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED = "true";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@x.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job1", userId: "u1", status: "COMPLETED", outputPath: "/safe/out/a.mp4" });
    mocks.create.mockResolvedValueOnce({ id: "s1", expiresAt: new Date("2030-01-01T00:00:00Z") });
    const res = await createShare(new Request("http://localhost", { method: "POST", body: JSON.stringify({ expiresInHours: 2 }) }) as never, { params: Promise.resolve({ id: "job1" }) });
    expect(res.status).toBe(200);
  });

  it("cross-user cannot create", async () => {
    process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED = "true";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u2", email: "u2@x.com" });
    mocks.findFirst.mockResolvedValueOnce(null);
    const res = await createShare(new Request("http://localhost", { method: "POST", body: "{}" }) as never, { params: Promise.resolve({ id: "job1" }) });
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
    process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED = "true";
    mocks.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() - 1000), revokedAt: null, renderJob: { status: "COMPLETED", outputPath: "/safe/out/a.mp4", id: "job1" } });
    const res = await publicDownload(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    m.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() - 1000), revokedAt: null, renderJob: { id: "job-1", status: "COMPLETED", outputPath: "/safe/out/a.mp4" } });
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    expect(res.status).toBe(410);
  });

  it("revoked token rejected", async () => {
    process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED = "true";
    mocks.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 1000), revokedAt: new Date(), renderJob: { status: "COMPLETED", outputPath: "/safe/out/a.mp4", id: "job1" } });
    const res = await publicDownload(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    m.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 1000), revokedAt: new Date(), renderJob: { id: "job-1", status: "COMPLETED", outputPath: "/safe/out/a.mp4" } });
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    expect(res.status).toBe(410);
  });

  it("no outputPath exposure", async () => {
    process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED = "true";
    mocks.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 1000), revokedAt: null, renderJob: { status: "COMPLETED", outputPath: "/safe/out/private.mp4", id: "job1" } });
    mocks.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT"));
    const res = await publicDownload(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    m.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 1000), revokedAt: null, renderJob: { id: "job-1", status: "COMPLETED", outputPath: "/safe/out/private.mp4" } });
    m.resolveRenderArtifactPath.mockRejectedValueOnce(new Error("ENOENT /safe/out/private.mp4"));
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(JSON.stringify(body)).not.toContain("/safe/out/private.mp4");
  });

  it("owner revoke", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "u1@x.com" });
    const res = await revokeShare(new Request("http://localhost", { method: "DELETE" }) as never, { params: Promise.resolve({ id: "job1" }) });
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    m.updateMany.mockResolvedValueOnce({ count: 1 });
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(200);
  });
});
