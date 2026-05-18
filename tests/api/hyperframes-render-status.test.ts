import { describe, it, expect, vi } from "vitest";
import * as auth from "@/lib/auth";
import { GET } from "@/app/api/hyperframes/render/status/route";

const state = {
  counts: new Map<string, number>([
    ["PENDING", 2],
    ["RUNNING", 1],
    ["COMPLETED", 5],
    ["FAILED", 1],
  ]),
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      count: vi.fn().mockImplementation(async ({ where }: { where: { status: string } }) => state.counts.get(where.status) ?? 0),
      findFirst: vi.fn().mockResolvedValue({ createdAt: new Date("2026-05-17T10:00:00.000Z") }),
    },
  },
}));

describe("hyperframes render status api", () => {
  it("blocks unauthenticated request", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce(null);
    const res = await GET(new Request("http://localhost/api/hyperframes/render/status") as never);
    expect(res.status).toBe(401);
  });

  it("returns controlled 404 when endpoint disabled", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_OPERATOR_STATUS_ENABLED = "false";
    const res = await GET(new Request("http://localhost/api/hyperframes/render/status") as never);
    expect(res.status).toBe(404);
  });

  it("returns safe JSON when enabled", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValueOnce({ userId: "u1", email: "a@a.com" });
    process.env.HYPERFRAMES_OPERATOR_STATUS_ENABLED = "true";
    process.env.HYPERFRAMES_RENDER_ENABLED = "false";
    const res = await GET(new Request("http://localhost/api/hyperframes/render/status") as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.pending).toBe(2);
    expect(body.data.running).toBe(1);
    expect(body.data.renderEnabled).toBe(false);
    expect(body.data).toHaveProperty("staleRunning");
    expect(body.data).not.toHaveProperty("DATABASE_URL");
    expect(JSON.stringify(body)).not.toContain("postgresql://");
    expect(body.data).not.toHaveProperty("outputDir");
  });
});
