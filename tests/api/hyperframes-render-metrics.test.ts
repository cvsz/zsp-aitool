import { beforeEach, describe, expect, it, vi } from "vitest";

import * as auth from "@/lib/auth";
import { GET } from "@/app/api/hyperframes/render/metrics/route";

const mocks = vi.hoisted(() => ({ state: { pending: 0, running: 0, completed: 12, failed: 1, completed24: 3, failed24: 1 } }));
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { count: vi.fn().mockImplementation(async ({ where }: any) => {
  if (where?.status === "PENDING") return mocks.state.pending;
  if (where?.status === "RUNNING") return mocks.state.running;
  if (where?.status === "COMPLETED" && where?.completedAt) return mocks.state.completed24;
  if (where?.status === "FAILED" && where?.failedAt) return mocks.state.failed24;
  if (where?.status === "COMPLETED") return mocks.state.completed;
  if (where?.status === "FAILED") return mocks.state.failed;
  return 0;
}), findFirst: vi.fn().mockResolvedValue(null) } } }));
vi.mock("node:child_process", async (o) => { const a = await o<typeof import("node:child_process")>(); return { ...a, execSync: vi.fn().mockReturnValue("active") }; });
vi.mock("node:fs", async (o) => { const a = await o<typeof import("node:fs")>(); return { ...a, statfsSync: vi.fn().mockReturnValue({ bavail: 1000n, bsize: 1024n }) }; });

describe("hyperframes render metrics", () => {
  beforeEach(() => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    process.env.HYPERFRAMES_METRICS_ENABLED = "true";
    process.env.HYPERFRAMES_OPERATOR_EMAILS = "ops@example.com";
    delete process.env.HYPERFRAMES_INTERNAL_TOKEN;
  });

  it("returns 404 when disabled", async () => {
    process.env.HYPERFRAMES_METRICS_ENABLED = "false";
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    expect(res.status).toBe(404);
  });

  it("requires auth when no internal token", async () => {
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    expect(res.status).toBe(401);
  });

  it("allows configured operator email", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "ops", email: "ops@example.com" });
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("allows internal bearer token and prometheus format", async () => {
    process.env.HYPERFRAMES_INTERNAL_TOKEN = "secret-token";
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics?format=prometheus", { headers: { authorization: "Bearer secret-token" } }) as never);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
  });
});
