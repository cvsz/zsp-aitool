import { describe, it, expect, vi } from "vitest";
import * as auth from "@/lib/auth";
import { POST as createJob } from "@/app/api/hyperframes/render/route";
import { GET as getJob } from "@/app/api/hyperframes/render/[id]/route";
import { POST as cancelJob } from "@/app/api/hyperframes/render/[id]/cancel/route";

vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { create: vi.fn().mockResolvedValue({ id: "j1", status: "PENDING" }), findFirst: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue({ id: "j1", status: "CANCELLED" }) } } }));

describe("hyperframes render api", () => {
  it("returns 401 unauthenticated", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", body: "{}" }) as never);
    expect(res.status).toBe(401);
  });

  it("returns disabled when flag false", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_RENDER_ENABLED = "false";
    const res = await createJob(new Request("http://localhost/api/hyperframes/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "16:9", durationSeconds: 10, caption: "ok" }) }) as never);
    expect(res.status).toBe(503);
  });

  it("status endpoint user-scoped 404", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const res = await getJob(new Request("http://localhost") as never, { params: Promise.resolve({ id: "jx" }) });
    expect(res.status).toBe(404);
  });

  it("cancel endpoint user-scoped 404", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const res = await cancelJob(new Request("http://localhost", { method: "POST" }) as never, { params: Promise.resolve({ id: "jx" }) });
    expect(res.status).toBe(404);
  });
});
