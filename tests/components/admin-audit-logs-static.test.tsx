import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin audit logs page", () => {
  it("renders audit table labels", () => {
    const source = readFileSync("src/app/dashboard/admin/audit-logs/page.tsx", "utf8");
    expect(source).toContain("รายการเหตุการณ์");
    expect(source).toContain("Action");
  });
});
