import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { GET as getQueue } from "@/app/api/hyperframes/operator/queue/route";
import { POST as cancelJob } from "@/app/api/hyperframes/operator/jobs/[id]/cancel/route";
import { POST as recoverStale } from "@/app/api/hyperframes/operator/jobs/[id]/recover-stale/route";

const state = {
  findFirst: vi.fn(),
  update: vi.fn(),
  status: { pending: 1, running: 1, failedLast24h: 0, staleRunning: 1, serviceActive: true, diskFreeMb: 1024 }
};

vi.mock("@/lib/prisma", () => ({
  prisma: { hyperFrameRenderJob: { findFirst: (...args: unknown[]) => state.findFirst(...args), update: (...args: unknown[]) => state.update(...args) } }
}));

vi.mock("@/lib/hyperframes/operator-status", () => ({
  getHyperFramesOperatorStatus: vi.fn(async () => state.status),
}));

describe("hyperframes operator controls", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.HYPERFRAMES_OPERATOR_CONTROLS_ENABLED = "true";
    process.env.HYPERFRAMES_OPERATOR_ALLOWED_EMAILS = "operator@example.com";
    state.findFirst.mockReset();
    state.update.mockReset();
  });

  it("blocks unauthenticated", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await getQueue(new Request("http://localhost/api/hyperframes/operator/queue") as never);
    expect(res.status).toBe(401);
  });

  it("blocks normal user", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "user@example.com" });
    const res = await getQueue(new Request("http://localhost/api/hyperframes/operator/queue") as never);
    expect(res.status).toBe(403);
  });

  it("returns 403 when controls disabled", async () => {
    process.env.HYPERFRAMES_OPERATOR_CONTROLS_ENABLED = "false";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "operator@example.com" });
    const res = await getQueue(new Request("http://localhost/api/hyperframes/operator/queue") as never);
    expect(res.status).toBe(403);
  });

  it("operator sees safe queue payload without outputPath", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "operator@example.com" });
    const res = await getQueue(new Request("http://localhost/api/hyperframes/operator/queue") as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.outputPath).toBeUndefined();
    expect(Object.keys(body.data).sort()).toEqual(["diskFreeMb", "failedLast24h", "pending", "running", "serviceActive", "staleRunning"].sort());
  });

  it("stale recovery requires confirmation", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "operator@example.com" });
    const res = await recoverStale(new Request("http://localhost/api/hyperframes/operator/jobs/j1/recover-stale", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    expect(res.status).toBe(400);
  });

  it("cancel cross-tenant blocked", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "operator@example.com" });
    state.findFirst.mockResolvedValue(null);
    const res = await cancelJob(new Request("http://localhost/api/hyperframes/operator/jobs/j1/cancel?confirm=true", { method: "POST" }) as never, { params: Promise.resolve({ id: "j1" }) });
    expect(res.status).toBe(404);
  });
});
