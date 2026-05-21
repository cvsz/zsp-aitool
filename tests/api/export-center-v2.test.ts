import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("export center routes exist", () => {
  it("includes v2 product route with auth", () => {
    const source = readFileSync(join(process.cwd(), "src/app/api/export/v2/products/route.ts"), "utf8");
    expect(source).toContain("withAuth");
  });
});
