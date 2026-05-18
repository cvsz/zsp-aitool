import { describe, expect, it, vi } from "vitest";

const mkdirMock = vi.fn().mockResolvedValue(undefined);

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    mkdir: mkdirMock,
    writeFile: vi.fn().mockResolvedValue(undefined),
  };
});

const execFileMock = vi.fn();

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    execFile: execFileMock,
    default: { ...((actual as unknown as { default?: object }).default ?? {}), execFile: execFileMock },
  };
});

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

  it("uses configured npx command vector and logs full command", async () => {
    vi.resetModules();
    execFileMock.mockImplementation((_bin, _args, _opts, cb) => cb(null, "", ""));
    process.env.HYPERFRAMES_RENDER_ENABLED = "true";
    process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM = "YES";
    process.env.HYPERFRAMES_CLI_BIN = "npx";
    process.env.HYPERFRAMES_CLI_ARGS = "-y hyperframes";
    process.env.HYPERFRAMES_WORKDIR = "/tmp/hf-w";
    process.env.HYPERFRAMES_OUTPUT_DIR = "/tmp/hf-o";

    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { runRenderSmoke } = await import("../scripts/hyperframes/render-smoke");
    const result = await runRenderSmoke();

    expect(result.ok).toBe(true);
    expect(execFileMock).toHaveBeenCalled();
    const [bin, args] = execFileMock.mock.calls[0] as [string, string[]];
    expect(bin).toBe("npx");
    expect(args.slice(0, 3)).toEqual(["-y", "hyperframes", "render"]);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("[OK] running: npx -y hyperframes render"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("[OK] running: hyperframes render"));
    expect(args[args.indexOf("--input") + 1]).not.toMatch(/\.html$/);
    expect(args[args.indexOf("--input") + 1]).toMatch(/^\/tmp\/hf-w\/smoke-/);
    expect(args[args.indexOf("--output") + 1]).toBe("/tmp/hf-o/smoke/render-smoke.mp4");
    const inputDir = args[args.indexOf("--input") + 1];
    expect(inputDir).toContain("/smoke-");
    expect(inputDir).not.toContain("composition.html");
  });
});
