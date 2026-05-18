import { describe, expect, it, vi } from "vitest";

describe("render smoke gates", () => {
  it("refuses when render is disabled", async () => {
    vi.resetModules();
    process.env.HYPERFRAMES_RENDER_ENABLED = "false";
    process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM = "YES";

    const { runRenderSmoke } = await import("../scripts/hyperframes/render-smoke");
    const result = await runRenderSmoke();
    expect(result.skipped).toBe(true);
  });

  it("refuses when confirmation is missing", async () => {
    vi.resetModules();
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    delete process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM;

    const { runRenderSmoke } = await import("../scripts/hyperframes/render-smoke");
    const result = await runRenderSmoke();
    expect(result.skipped).toBe(true);
  });
});
