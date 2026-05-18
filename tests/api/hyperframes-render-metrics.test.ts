import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/hyperframes/render/metrics/route";
import * as auth from "@/lib/auth";

const state = {
  counts: new Map<string, number>([
    ["PENDING", 2],
    ["RUNNING", 1],
    ["COMPLETED", 9],
    ["FAILED", 3],
  ]),
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      count: vi.fn().mockImplementation(async ({ where }: { where: { status: string } }) => state.counts.get(where.status) ?? 0),
      findFirst: vi.fn().mockResolvedValue({ createdAt: new Date("2026-05-17T10:00:00.000Z"), startedAt: new Date("2026-05-17T10:00:00.000Z") }),
    },
  },
}));

describe("hyperframes render metrics api", () => {
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as auth from "@/lib/auth";
import { GET } from "@/app/api/hyperframes/render/metrics/route";

const state = { pending: 0, running: 0, completed: 12, failed: 1, completed24: 3, failed24: 1 };
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: { count: vi.fn().mockImplementation(async ({ where }: any) => {
  if (where?.status === "PENDING") return state.pending;
  if (where?.status === "RUNNING") return state.running;
  if (where?.status === "COMPLETED" && where?.completedAt) return state.completed24;
  if (where?.status === "FAILED" && where?.failedAt) return state.failed24;
  if (where?.status === "COMPLETED") return state.completed;
  if (where?.status === "FAILED") return state.failed;
  return 0;
}) } } }));
vi.mock("node:child_process", async (o) => { const a = await o<typeof import("node:child_process")>(); return { ...a, execSync: vi.fn().mockReturnValue("active") }; });
vi.mock("node:fs", async (o) => { const a = await o<typeof import("node:fs")>(); return { ...a, statfsSync: vi.fn().mockReturnValue({ bavail: 1000n, bsize: 1024n }) }; });

beforeEach(() => {
  process.env.HYPERFRAMES_METRICS_ENABLED = "true";
  process.env.HYPERFRAMES_OPERATOR_EMAILS = "ops@example.com";
  delete process.env.HYPERFRAMES_INTERNAL_TOKEN;
});

describe("hyperframes render metrics", () => {
  it("returns 404 when disabled", async () => {
    process.env.HYPERFRAMES_METRICS_ENABLED = "false";
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    expect([403, 404]).toContain(res.status);
  });

  it("requires auth when no internal token", async () => {
    process.env.HYPERFRAMES_METRICS_ENABLED = "true";
    process.env.HYPERFRAMES_INTERNAL_TOKEN = "";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce(null);
  it("requires auth when no token", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    expect(res.status).toBe(401);
  });

  it("returns safe JSON for operator", async () => {
    process.env.HYPERFRAMES_METRICS_ENABLED = "true";
    process.env.HYPERFRAMES_OPERATOR_EMAILS = "ops@example.com";
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "ops@example.com" });
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.pending).toBe(2);
    expect(body.data.completedTotal).toBe(9);
    expect(body.data).not.toHaveProperty("outputPath");
    expect(JSON.stringify(body)).not.toContain("postgresql://");
  });

  it("supports prometheus format", async () => {
    process.env.HYPERFRAMES_METRICS_ENABLED = "true";
    process.env.HYPERFRAMES_INTERNAL_TOKEN = "internal-test-token";
    const req = new Request("http://localhost/api/hyperframes/render/metrics?format=prometheus", { headers: { authorization: "Bearer internal-test-token" } });
    const res = await GET(req as never);
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(text).toContain("hyperframes_pending_jobs");
  it("forbids non-operator users", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "user@example.com", exp: 9999999999 });
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    expect(res.status).toBe(403);
  });

  it("returns safe JSON metrics for operator", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "ops@example.com", exp: 9999999999 });
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.pending).toBeTypeOf("number");
    expect(body.data.outputPath).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("token");
  });

  it("supports internal token and prometheus format", async () => {
    process.env.HYPERFRAMES_INTERNAL_TOKEN = "secret-token";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics?format=prometheus&token=secret-token") as never);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("hyperframes_completed_total");
    expect(text).not.toContain("outputPath");
  });
});
