import { describe, expect, it, vi } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    execFile: vi.fn((bin: string, args: string[], cb?: (err: Error | null, out?: { stdout: string; stderr: string }) => void) => {
      if (typeof cb === "function") cb(null, "duration=7\nformat_name=mov,mp4,m4a,3gp,3g2,mj2\n", "");
    }),
  };
});

import { validateRenderArtifact } from "@/lib/hyperframes/render-validation";

describe("validateRenderArtifact", () => {
  it("passes for a valid output artifact", async () => {
    const dir = mkdtempSync(join(tmpdir(), "hf-val-"));
    const file = join(dir, "ok.mp4");
    writeFileSync(file, Buffer.alloc(4096, 1));

    await expect(
      validateRenderArtifact({ outputPath: file, minBytes: 1024, maxOutputMb: 10, expectedDurationSeconds: 60 })
    ).resolves.toBeUndefined();
  });

  it("fails for disallowed file extension", async () => {
    const dir = mkdtempSync(join(tmpdir(), "hf-val-"));
    const file = join(dir, "bad.txt");
    writeFileSync(file, Buffer.alloc(4096, 1));

    await expect(
      validateRenderArtifact({ outputPath: file, minBytes: 1024, maxOutputMb: 10, expectedDurationSeconds: 60 })
    ).rejects.toThrow(/format not allowed/i);
import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { validateRenderArtifact } from "@/lib/hyperframes/render-validation";

describe("validateRenderArtifact", () => {
  it("accepts a readable artifact within limits", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "hf-val-"));
    const file = path.join(dir, "ok.mp4");
    writeFileSync(file, Buffer.alloc(2048, 1));

    await expect(validateRenderArtifact(file, { minBytes: 1024, maxOutputMb: 2, maxDurationSeconds: 60, probeDuration: false })).resolves.toBeUndefined();
  });

  it("rejects disallowed format", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "hf-val-"));
    const file = path.join(dir, "bad.txt");
    writeFileSync(file, "x");

    await expect(validateRenderArtifact(file, { minBytes: 1, maxOutputMb: 2, maxDurationSeconds: 60, probeDuration: false })).rejects.toThrow(/format not allowed/);
  });
});
