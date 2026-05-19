import { describe, it, expect, vi } from "vitest";
import * as auth from "@/lib/auth";
import { GET as historyGet } from "@/app/api/hyperframes/render/history/route";
import { POST as cancelPost } from "@/app/api/hyperframes/render/[id]/cancel/route";

const jobs = [
  { id: "org-a", userId: "u1", orgId: "o1", status: "PENDING", attempts: 0, outputPath: null, durationSeconds: null, width: null, height: null, createdAt: new Date(), startedAt: null, completedAt: null, failedAt: null, errorMessage: null, compositionMetadata: {} },
  { id: "org-b", userId: "u2", orgId: "o1", status: "FAILED", attempts: 0, outputPath: null, durationSeconds: null, width: null, height: null, createdAt: new Date(), startedAt: null, completedAt: null, failedAt: null, errorMessage: null, compositionMetadata: {} },
  { id: "other-org", userId: "u3", orgId: "o2", status: "PENDING", attempts: 0, outputPath: null, durationSeconds: null, width: null, height: null, createdAt: new Date(), startedAt: null, completedAt: null, failedAt: null, errorMessage: null, compositionMetadata: {} },
];

const roleMap: Record<string, "VIEWER" | "EDITOR" | "ADMIN" | undefined> = { "o1:u1": "VIEWER", "o1:u2": "ADMIN" };

vi.mock("@/lib/prisma", () => ({ prisma: { orgMembership: { findUnique: vi.fn().mockImplementation(async ({ where }: { where: { orgId_userId: { orgId: string; userId: string } } }) => { const role = roleMap[`${where.orgId_userId.orgId}:${where.orgId_userId.userId}`]; return role ? { role } : null; }) }, hyperFrameRenderJob: { findMany: vi.fn().mockImplementation(async ({ where }: { where: { orgId?: string } }) => jobs.filter((j) => j.orgId === where.orgId)), findFirst: vi.fn().mockImplementation(async ({ where }: { where: { id: string; orgId?: string } }) => jobs.find((j) => j.id === where.id && j.orgId === where.orgId) ?? null), update: vi.fn().mockResolvedValue({ id: "org-a", status: "CANCELLED" }) } } }));

describe("hyperframes org scope", () => {
  it("org member can view org jobs", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "x@y.com" });
    const res = await historyGet(new Request("http://localhost/api/hyperframes/render/history?orgId=o1") as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(2);
  });

  it("non-member blocked", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "x@y.com" });
    const res = await historyGet(new Request("http://localhost/api/hyperframes/render/history?orgId=o2") as never);
    expect(res.status).toBe(404);
  });

  it("viewer cannot cancel", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "x@y.com" });
    const res = await cancelPost(new Request("http://localhost/api/hyperframes/render/org-a/cancel?orgId=o1", { method: "POST" }) as never, { params: Promise.resolve({ id: "org-a" }) });
    expect(res.status).toBe(403);
  });
});
