import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("backend monitor script static", () => {
  it("is wired in package scripts", () => {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    expect(pkg.scripts["monitor:backend"]).toBe("tsx scripts/monitor/backend-monitor.ts");
  });
});
