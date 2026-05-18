import { describe, expect, it, vi } from "vitest";
import { RenderJobStatus } from "@prisma/client";

const state = {
  userExists: true,
  createdJobs: [] as Array<Record<string, unknown>>,
  pendingCount: 0,
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockImplementation(async () => (state.userExists ? { id: "u1" } : null)),
    },
    hyperFrameRenderJob: {
      count: vi.fn().mockImplementation(async () => state.pendingCount),
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        state.createdJobs.push(data);
        return { id: "job-smoke-1", status: RenderJobStatus.PENDING };
      }),
    },
  },
}));

describe("enqueue smoke job", () => {
  it("refuses when render is disabled", async () => {
    vi.resetModules();
    process.env.HYPERFRAMES_RENDER_ENABLED = "false";
    process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM = "YES";
    process.env.HYPERFRAMES_SMOKE_USER_ID = "u1";

    const { enqueueSmokeJob } = await import("../scripts/hyperframes/enqueue-smoke-job");
    await expect(enqueueSmokeJob()).rejects.toThrow("HYPERFRAMES_RENDER_ENABLED must be true");
  });

  it("refuses when smoke confirm is missing", async () => {
    vi.resetModules();
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM = "NO";
    process.env.HYPERFRAMES_SMOKE_USER_ID = "u1";

    const { enqueueSmokeJob } = await import("../scripts/hyperframes/enqueue-smoke-job");
    await expect(enqueueSmokeJob()).rejects.toThrow("HYPERFRAMES_RENDER_SMOKE_CONFIRM must be YES");
  });

  it("refuses when smoke user id is missing", async () => {
    vi.resetModules();
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM = "YES";
    delete process.env.HYPERFRAMES_SMOKE_USER_ID;

    const { enqueueSmokeJob } = await import("../scripts/hyperframes/enqueue-smoke-job");
    await expect(enqueueSmokeJob()).rejects.toThrow("HYPERFRAMES_SMOKE_USER_ID is required");
  });

  it("validates user existence using prisma", async () => {
    vi.resetModules();
    state.userExists = false;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM = "YES";
    process.env.HYPERFRAMES_SMOKE_USER_ID = "u-missing";

    const { enqueueSmokeJob } = await import("../scripts/hyperframes/enqueue-smoke-job");
    await expect(enqueueSmokeJob()).rejects.toThrow("HYPERFRAMES_SMOKE_USER_ID does not exist");
    state.userExists = true;
  });

  it("creates exactly one pending job with deterministic safe composition", async () => {
    vi.resetModules();
    state.createdJobs.length = 0;
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM = "YES";
    process.env.HYPERFRAMES_SMOKE_USER_ID = "u1";

    const { enqueueSmokeJob } = await import("../scripts/hyperframes/enqueue-smoke-job");
    const result = await enqueueSmokeJob();

    expect(result).toEqual({ jobId: "job-smoke-1", status: RenderJobStatus.PENDING });
    expect(state.createdJobs).toHaveLength(1);
    const job = state.createdJobs[0] as {
      status: string;
      compositionHtml: string;
      compositionMetadata: Record<string, unknown>;
    };
    expect(job.status).toBe(RenderJobStatus.PENDING);
    expect(job.compositionHtml).toContain("<!doctype html>");
    expect(job.compositionHtml).toContain("lang=\"th\"");
    expect(job.compositionHtml).not.toContain("<script");
    expect(job.compositionMetadata.source).toBe("smoke");
    expect(job.compositionMetadata.createdBy).toBe("hyperframes:enqueue-smoke-job");
    expect(job.compositionMetadata.aspectRatio).toBe("16:9");
    expect(job.compositionMetadata.width).toBe(1280);
    expect(job.compositionMetadata.height).toBe(720);
    expect(job.compositionMetadata.durationSeconds).toBeTypeOf("number");
  });
});


it("refuses when pending queue exceeds limit", async () => {
  vi.resetModules();
  state.pendingCount = 25;
  process.env.HYPERFRAMES_RENDER_ENABLED = "true";
  process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM = "YES";
  process.env.HYPERFRAMES_SMOKE_USER_ID = "u1";
  process.env.HYPERFRAMES_MAX_PENDING_JOBS = "25";

  const { enqueueSmokeJob } = await import("../scripts/hyperframes/enqueue-smoke-job");
  await expect(enqueueSmokeJob()).rejects.toThrow("[SKIP] pending queue limit reached");
  state.pendingCount = 0;
});
