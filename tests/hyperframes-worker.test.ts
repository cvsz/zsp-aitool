import { describe, expect, it, vi } from "vitest";
import { RenderJobStatus } from "@prisma/client";

const state = {
  job: {
    id: "j1",
    status: RenderJobStatus.PENDING,
    compositionHtml: "<html></html>",
    deletedAt: null,
    createdAt: new Date()
  },
  updates: [] as Array<{ where: unknown; data: unknown }>,
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      findFirst: vi.fn().mockImplementation(() => state.job),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockResolvedValue({ id: "j1", compositionHtml: "<html></html>" }),
      update: vi.fn().mockImplementation((x) => {
        state.updates.push(x);
        return Promise.resolve(x);
      })
    }
  }
}));

describe("worker", () => {
  it("keeps disabled worker path unchanged", async () => {
    vi.resetModules();
    process.env.HYPERFRAMES_RENDER_ENABLED = "false";
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const { runWorker } = await import("../scripts/hyperframes/render-worker");
    await runWorker(["--once"]);

    expect(log).toHaveBeenCalledWith(JSON.stringify({ level: "info", message: "render disabled" }));
  });

  it("marks failed job with controlled error", async () => {
    vi.resetModules();
    state.updates.length = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_WORKDIR = "/tmp/hf-w";
    process.env.HYPERFRAMES_OUTPUT_DIR = "/tmp/hf-o";

    const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
    const processed = await processOnePendingJob({
      workerId: "worker-test",
      now: () => new Date("2026-01-01T00:00:00.000Z"),
      runRenderCommand: async () => {
        throw new Error("simulated render failure");
      }
    });

    expect(processed).toBe(true);
    const failUpdate = state.updates.at(-1);
    expect(failUpdate).toBeDefined();
    expect((failUpdate?.data as { status: string }).status).toBe(RenderJobStatus.FAILED);
    expect((failUpdate?.data as { errorMessage: string }).errorMessage).toContain("HyperFrames render failed:");
    expect((failUpdate?.data as { failedAt: Date }).failedAt).toEqual(new Date("2026-01-01T00:00:00.000Z"));
  });
});
