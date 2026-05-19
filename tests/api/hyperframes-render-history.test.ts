import { describe, it, expect, vi } from "vitest";
import * as auth from "@/lib/auth";
import { GET as historyGet } from "@/app/api/hyperframes/render/history/route";
import { POST as cancelPost } from "@/app/api/hyperframes/render/[id]/cancel/route";

const jobs = [
  { id: "a1", userId: "u1", status: "COMPLETED", attempts: 1, outputPath: "/var/lib/zsp-aitool/hyperframes/renders/a.mp4", durationSeconds: 12, width: 1080, height: 1920, createdAt: new Date(), startedAt: null, completedAt: new Date(), failedAt: null, errorMessage: null, compositionMetadata: { platform: "tiktok", aspectRatio: "9:16" } },
  { id: "a2", userId: "u1", status: "PENDING", attempts: 0, outputPath: null, durationSeconds: null, width: null, height: null, createdAt: new Date(), startedAt: null, completedAt: null, failedAt: null, errorMessage: null, compositionMetadata: {} },
  { id: "b1", userId: "u2", status: "FAILED", attempts: 1, outputPath: null, durationSeconds: null, width: null, height: null, createdAt: new Date(), startedAt: null, completedAt: null, failedAt: new Date(), errorMessage: "error at /var/lib/secret/stack.js", compositionMetadata: {} },
];

vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { findMany: vi.fn().mockImplementation(async ({ where }: { where: { userId: string } }) => jobs.filter((j) => j.userId === where.userId)), findFirst: vi.fn().mockImplementation(async ({ where }: { where: { id: string; userId: string } }) => jobs.find((j) => j.id === where.id && j.userId === where.userId) ?? null), update: vi.fn().mockResolvedValue({ id: "a2", status: "CANCELLED" }) } } }));

describe("hyperframes render history", () => {
  it("returns 401 unauthenticated", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce(null);
    const res = await historyGet(new Request("http://localhost/api/hyperframes/render/history") as never);
    expect(res.status).toBe(401);
  });

  it("returns only current user jobs and safe fields", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "x@y.com" });
    const res = await historyGet(new Request("http://localhost/api/hyperframes/render/history") as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(2);
    expect(JSON.stringify(body)).not.toContain("outputPath");
    expect(JSON.stringify(body)).not.toContain("ownerUserId");
    expect(body.data.items[0].downloadUrl).toContain("/download");
    expect(body.data.items[0].thumbnailUrl).toContain("/thumbnail");
  });

  it("returns 422 on invalid history query", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "x@y.com" });
    const res = await historyGet(new Request("http://localhost/api/hyperframes/render/history?limit=0") as never);
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("INVALID_QUERY");
  });

  it("cancel cross-user returns 404", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "x@y.com" });
    const res = await cancelPost(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "b1" }) });
    expect(res.status).toBe(404);
  });
});
