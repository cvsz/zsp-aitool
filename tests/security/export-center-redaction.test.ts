import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("export center redaction", () => {
  it("does not return outputPath in job list selector", () => {
    const source = readFileSync(join(process.cwd(), "src/app/api/export/v2/jobs/route.ts"), "utf8");
    expect(source).not.toContain("outputPath: true");
  });
});
