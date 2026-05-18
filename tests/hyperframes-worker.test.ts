import { describe, expect, it, vi } from "vitest";
import { RenderJobStatus } from "@prisma/client";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    mkdir: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined)
  };
});

const state = {
  job: {
    id: "j1",
    status: RenderJobStatus.PENDING,
    compositionHtml: "<html></html>",
    deletedAt: null,
    createdAt: new Date(),
  },
  updates: [] as Array<{ where: unknown; data: Record<string, unknown> }>,
  claimCount: 1,
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      findFirst: vi.fn().mockImplementation(() => (state.claimCount-- > 0 ? state.job : null)),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockResolvedValue({ id: "j1", compositionHtml: "<html></html>" }),
      update: vi.fn().mockImplementation((x) => {
        state.updates.push(x);
        return Promise.resolve(x);
      }),
    },
  },
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

  it("processes at most one pending job in --once", async () => {
    vi.resetModules();
    state.claimCount = 1;
    state.updates.length = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_WORKDIR = "/tmp/hf-w";
    process.env.HYPERFRAMES_OUTPUT_DIR = "/tmp/hf-o";

    const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
    const first = await processOnePendingJob({ runRenderCommand: async () => {} });
    const second = await processOnePendingJob({ runRenderCommand: async () => {} });

    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  it("marks completed job with safe output path", async () => {
    vi.resetModules();
    state.claimCount = 1;
    state.updates.length = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_WORKDIR = "/tmp/hf-w";
    process.env.HYPERFRAMES_OUTPUT_DIR = "/tmp/hf-o";

    const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
    await processOnePendingJob({ now: () => new Date("2026-01-01T00:00:00.000Z"), runRenderCommand: async () => {} });

    const doneUpdate = state.updates.at(-1);
    expect(doneUpdate?.data.status).toBe(RenderJobStatus.COMPLETED);
    expect(String(doneUpdate?.data.outputPath)).toMatch(/^\/tmp\/hf-o\//);
    expect(doneUpdate?.data.completedAt).toEqual(new Date("2026-01-01T00:00:00.000Z"));
  });

  it("marks failed job with controlled error", async () => {
    vi.resetModules();
    state.claimCount = 1;
    state.updates.length = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_WORKDIR = "/tmp/hf-w";
    process.env.HYPERFRAMES_OUTPUT_DIR = "/tmp/hf-o";

    const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
    const processed = await processOnePendingJob({
      workerId: "worker-test",
      now: () => new Date("2026-01-01T00:00:00.000Z"),
      runRenderCommand: async () => {
        throw new Error("simulated render failure\nstack: private");
      },
    });

    expect(processed).toBe(true);
    const failUpdate = state.updates.at(-1);
    expect(failUpdate).toBeDefined();
    expect((failUpdate?.data as { status: string }).status).toBe(RenderJobStatus.FAILED);
    const errorMessage = (failUpdate?.data as { errorMessage: string }).errorMessage;
    expect(errorMessage).toContain("HyperFrames render failed:");
    expect(errorMessage).not.toContain("Error: simulated render failure");
    expect(errorMessage).not.toContain("at ");
    expect((failUpdate?.data as { failedAt: Date }).failedAt).toEqual(new Date("2026-01-01T00:00:00.000Z"));
    expect(failUpdate?.data.status).toBe(RenderJobStatus.FAILED);
    expect(String(failUpdate?.data.errorMessage)).toContain("HyperFrames render failed:");
    expect(String(failUpdate?.data.errorMessage)).not.toContain("\n");
    expect(failUpdate?.data.failedAt).toEqual(new Date("2026-01-01T00:00:00.000Z"));
  });
});
