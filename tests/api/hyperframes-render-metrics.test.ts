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
  it("returns 404 when disabled", async () => {
    process.env.HYPERFRAMES_METRICS_ENABLED = "false";
    const res = await GET(new Request("http://localhost/api/hyperframes/render/metrics") as never);
    expect([403, 404]).toContain(res.status);
  });

  it("requires auth when no internal token", async () => {
    process.env.HYPERFRAMES_METRICS_ENABLED = "true";
    process.env.HYPERFRAMES_INTERNAL_TOKEN = "";
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce(null);
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
    expect(text).not.toContain("outputPath");
  });
});
