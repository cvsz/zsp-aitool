import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard final release UI", () => {
  it("includes final release sections and key routes", () => {
    const source = readFileSync(path.join(process.cwd(), "src/app/dashboard/page.tsx"), "utf8");

    expect(source).toContain("Final Release Dashboard");
    expect(source).toContain("Release Checklist");
    expect(source).toContain("Quick Ops");
    expect(source).toContain("/dashboard/products");
    expect(source).toContain("/dashboard/generator");
    expect(source).toContain("/dashboard/hyperframes");
    expect(source).toContain("/dashboard/templates");
  });
});
