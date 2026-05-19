import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { POST, DELETE } from "@/app/api/hyperframes/render/[id]/share/route";
import { GET } from "@/app/api/hyperframes/render/share/[token]/route";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
  findUnique: vi.fn(),
  resolveRenderArtifactPath: vi.fn(),
  openArtifactStream: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { findFirst: mocks.findFirst }, hyperFrameRenderShare: { create: mocks.create, updateMany: mocks.updateMany, findUnique: mocks.findUnique } } }));
vi.mock("@/lib/hyperframes/render-config", () => ({ getHyperFramesRenderConfig: () => ({ shareEnabled: process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED === "true", outputDir: "/safe/out", maxOutputMb: 512 }) }));
vi.mock("@/lib/hyperframes/artifact-access", () => ({
  resolveRenderArtifactPath: mocks.resolveRenderArtifactPath,
  getArtifactContentType: vi.fn().mockReturnValue("video/mp4"),
  buildSafeArtifactFilename: vi.fn().mockReturnValue("render.mp4"),
  openArtifactStream: mocks.openArtifactStream,
}));

describe("hyperframes render share", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED = "true";
    mocks.openArtifactStream.mockReturnValue(Readable.from([Buffer.from("ok")]));
  });

  it("share disabled returns 404", async () => {
    process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED = "false";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    const res = await POST(new Request("http://localhost", { method: "POST", body: "{}" }) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(404);
  });

  it("owner creates share", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    mocks.findFirst.mockResolvedValueOnce({ id: "job-1", userId: "u1", orgId: null, status: "COMPLETED", outputPath: "/safe/out/a.mp4" });
    mocks.create.mockResolvedValueOnce({ id: "s1" });
    const res = await POST(new Request("http://localhost", { method: "POST", body: JSON.stringify({ expiresInSeconds: 120 }) }) as never, { params: Promise.resolve({ id: "job-1" }) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.url).toContain("/api/hyperframes/render/share/");
  });

  it("cross-user cannot create", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u2", email: "b@b.com" });
    mocks.findFirst.mockResolvedValueOnce(null);
    const res = await POST(new Request("http://localhost", { method: "POST", body: "{}" }) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(404);
  });

  it("expired token rejected without path leak", async () => {
    mocks.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() - 1000), revokedAt: null, renderJob: { id: "job-1", status: "COMPLETED", outputPath: "/safe/out/a.mp4" } });
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    const body = await res.json();
    expect(res.status).toBe(410);
    expect(JSON.stringify(body)).not.toContain("/safe/out");
  });

  it("serves valid public token through artifact guard", async () => {
    mocks.findUnique.mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 100000), revokedAt: null, renderJob: { id: "job-1", status: "COMPLETED", outputPath: "/safe/out/a.mp4" } });
    mocks.resolveRenderArtifactPath.mockResolvedValueOnce("/safe/out/a.mp4");
    const res = await GET(new Request("http://localhost") as never, { params: Promise.resolve({ token: "abc" }) });
    expect(res.status).toBe(200);
  });

  it("revokes owner's share links", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    mocks.updateMany.mockResolvedValueOnce({ count: 1 });
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, { params: Promise.resolve({ id: "job-1" }) });
    expect(res.status).toBe(200);
  });
});
