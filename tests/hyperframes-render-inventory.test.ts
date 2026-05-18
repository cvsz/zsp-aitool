import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

let outputDir = "";
let jobs: Array<{ id: string; status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"; outputPath: string | null }> = [];
const updateMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      findMany: vi.fn(async () => jobs),
      update: updateMock,
    },
  },
}));

vi.mock("@/lib/hyperframes/render-config", () => ({
  getHyperFramesRenderConfig: () => ({ outputDir }),
}));

describe("render inventory", () => {
  beforeEach(async () => {
    outputDir = path.join(os.tmpdir(), `hf-inventory-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "a.mp4"), Buffer.alloc(100));
    await writeFile(path.join(outputDir, "orphan.mp4"), Buffer.alloc(200));

    jobs = [
      { id: "j1", status: "COMPLETED", outputPath: path.join(outputDir, "a.mp4") },
      { id: "j2", status: "COMPLETED", outputPath: path.join(outputDir, "missing.mp4") },
      { id: "j3", status: "FAILED", outputPath: null },
    ];
    updateMock.mockReset();
    delete process.env.HYPERFRAMES_INVENTORY_REPAIR;
  });

  it("detects missing artifact", async () => {
    const { runRenderInventory } = await import("../scripts/hyperframes/render-inventory");
    const result = await runRenderInventory();
    expect(result.missingArtifactCount).toBe(1);
  });

  it("detects orphan artifact", async () => {
    const { runRenderInventory } = await import("../scripts/hyperframes/render-inventory");
    const result = await runRenderInventory();
    expect(result.orphanArtifactCount).toBe(1);
  });

  it("repair disabled by default", async () => {
    const { runRenderInventory } = await import("../scripts/hyperframes/render-inventory");
    const result = await runRenderInventory();
    expect(result.repairEnabled).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("blocks path traversal", async () => {
    jobs = [{ id: "bad", status: "COMPLETED", outputPath: "/etc/passwd" }];
    const { runRenderInventory } = await import("../scripts/hyperframes/render-inventory");
    await expect(runRenderInventory()).rejects.toThrow("ARTIFACT_OUTSIDE_OUTPUT_DIR");
  });

  it("main output does not print secret env values", async () => {
    process.env.HYPERFRAMES_SECRET_TOKEN = "super-secret";
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { main } = await import("../scripts/hyperframes/render-inventory");
    await main();
    expect(log.mock.calls.join(" ")).not.toContain("super-secret");
    log.mockRestore();
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });
});
