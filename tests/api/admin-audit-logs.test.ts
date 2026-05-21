import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin audit log routes", () => {
  it("requires admin enabled gate", () => {
    const source = readFileSync("src/app/api/admin/audit-logs/route.ts", "utf8");
    expect(source).toContain("isAdminPanelEnabled");
    expect(source).toContain("ADMIN_DISABLED");
  });
});
