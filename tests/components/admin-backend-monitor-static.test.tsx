import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("admin backend monitor page static", () => {
  it("contains required states markers", () => {
    const source = readFileSync(path.join(process.cwd(), "src/app/dashboard/admin/backend-monitor/page.tsx"), "utf8");
    expect(source).toContain("AdminShell");
    expect(source).toContain("Warnings");
    expect(source).toContain("DB");
  });
});
