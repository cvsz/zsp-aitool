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
