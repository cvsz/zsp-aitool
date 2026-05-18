import { describe, expect, it, vi } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return { ...actual, execSync: vi.fn().mockReturnValue("99999\n"), execFile: vi.fn((bin: string, args: string[], cb?: (err: Error | null, out?: { stdout: string; stderr: string } | string) => void) => {
      if (typeof cb === "function") cb(null, "duration=10\nformat_name=mov,mp4,m4a,3gp,3g2,mj2\n", "");
    }) };
});
import { RenderJobStatus } from "@prisma/client";

const mkdirMock = vi.fn().mockResolvedValue(undefined);
const statMock = vi.fn().mockResolvedValue({ size: 2048, isFile: () => true });

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    mkdir: mkdirMock,
    rm: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    stat: statMock
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
  runningCount: 0,
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      count: vi.fn().mockImplementation(async () => state.runningCount),
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
    process.env.HYPERFRAMES_MIN_FREE_MB = "1";
    process.env.HYPERFRAMES_FFPROBE_BIN = "__missing_ffprobe__";

    const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
    const first = await processOnePendingJob({ runRenderCommand: async () => {} });
    const second = await processOnePendingJob({ runRenderCommand: async () => {} });

    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  it("marks completed job with safe output path", async () => {
    state.claimCount = 1;
    state.updates.length = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_WORKDIR = "/tmp/hf-w";
    process.env.HYPERFRAMES_OUTPUT_DIR = "/tmp/hf-o";
    process.env.HYPERFRAMES_MIN_FREE_MB = "1";
    process.env.HYPERFRAMES_FFPROBE_BIN = "__missing_ffprobe__";
    statMock.mockResolvedValue({ size: 4096, isFile: () => true });

    const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
    await processOnePendingJob({
      now: () => new Date("2026-01-01T00:00:00.000Z"),
      maybeExtractThumbnail: async () => true,
      runRenderCommand: async (_bin, args) => {
        const outputPath = args[args.indexOf("--output") + 1];
        mkdirSync("/tmp/hf-o", { recursive: true });
        writeFileSync(outputPath, Buffer.alloc(4096, 7));
      }
    });

    const doneUpdate = state.updates.at(-1);
    expect(doneUpdate?.data.status).toBe(RenderJobStatus.COMPLETED);
    expect(String(doneUpdate?.data.outputPath)).toMatch(/^\/tmp\/hf-o\//);
    expect(doneUpdate?.data.completedAt).toEqual(new Date("2026-01-01T00:00:00.000Z"));
    expect((doneUpdate?.data.compositionMetadata as Record<string, unknown>).thumbnailName).toBe("j1.jpg");
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


  it("fails job when artifact validation fails", async () => {
    state.claimCount = 1;
    state.updates.length = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_WORKDIR = "/tmp/hf-w";
    process.env.HYPERFRAMES_OUTPUT_DIR = "/tmp/hf-o";
    process.env.HYPERFRAMES_MIN_FREE_MB = "1";
    process.env.HYPERFRAMES_FFPROBE_BIN = "__missing_ffprobe__";
    statMock.mockResolvedValue({ size: 10, isFile: () => true });

    const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
    await processOnePendingJob({
      now: () => new Date("2026-01-01T00:00:00.000Z"),
      runRenderCommand: async (_bin, args) => {
        const outputPath = args[args.indexOf("--output") + 1];
        mkdirSync("/tmp/hf-o", { recursive: true });
        writeFileSync(outputPath, Buffer.from("small"));
      }
    });

    const failUpdate = state.updates.at(-1);
    expect(failUpdate?.data.status).toBe(RenderJobStatus.FAILED);
    expect(String(failUpdate?.data.errorMessage)).toContain("HyperFrames render failed:");
  });
  it("uses npx command vector in enabled worker path", async () => {
    vi.resetModules();
    state.claimCount = 1;
    state.updates.length = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_WORKDIR = "/tmp/hf-w";
    process.env.HYPERFRAMES_OUTPUT_DIR = "/tmp/hf-o";
    process.env.HYPERFRAMES_CLI_BIN = "npx";
    process.env.HYPERFRAMES_CLI_ARGS = "-y hyperframes";
    process.env.HYPERFRAMES_MIN_FREE_MB = "1";

    const runRenderCommand = vi.fn().mockResolvedValue(undefined);
    const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
    await processOnePendingJob({ runRenderCommand });

    expect(runRenderCommand).toHaveBeenCalledTimes(1);
    expect(runRenderCommand).toHaveBeenCalledWith(
      "npx",
      expect.arrayContaining(["-y", "hyperframes", "render"]),
    );
    const args = runRenderCommand.mock.calls[0]?.[1] as string[];
    expect(args[args.indexOf("--input") + 1]).toBe("/tmp/hf-w/j1");
    expect(args[args.indexOf("--input") + 1]).not.toMatch(/\.html$/);
    expect(args[args.indexOf("--output") + 1]).toBe("/tmp/hf-o/j1.mp4");
    expect(args).toEqual(expect.arrayContaining(["--input", "/tmp/hf-w/j1"]));
    expect(args).not.toEqual(expect.arrayContaining([expect.stringMatching(/composition\.html$/)]));
  });
});


it("does not claim when running count exceeds max", async () => {
  vi.resetModules();
  state.runningCount = 2;
  state.claimCount = 1;
  process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  process.env.HYPERFRAMES_MAX_RUNNING_JOBS = "1";
  const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
  const processed = await processOnePendingJob({ runRenderCommand: async () => {} });
  expect(processed).toBe(false);
  state.runningCount = 0;
});

it("does not claim attempts >= max", async () => {
  vi.resetModules();
  state.claimCount = 0;
  process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  const { processOnePendingJob } = await import("../scripts/hyperframes/render-worker");
  const processed = await processOnePendingJob({ runRenderCommand: async () => {} });
  expect(processed).toBe(false);
});
