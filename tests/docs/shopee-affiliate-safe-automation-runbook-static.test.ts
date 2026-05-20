import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("shopee affiliate safe automation runbook", () => {
  const runbookPath = path.join(process.cwd(), "docs/runbooks/shopee-affiliate-safe-automation.md");
  const body = fs.readFileSync(runbookPath, "utf8");

  it("documents forbidden automation controls", () => {
    expect(body).toContain("Automated portal login");
    expect(body).toContain("No fake OAuth");
  });

  it("documents csv formula injection protections", () => {
    expect(body).toContain("formula-like prefixes");
  });
});
