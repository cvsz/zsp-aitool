import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin ux static", () => {
  it("uses shared gated shell and aggregate wording", () => {
    const page = readFileSync("src/app/dashboard/admin/page.tsx", "utf8");
    const shell = readFileSync("src/components/admin/AdminShell.tsx", "utf8");
    expect(page).toContain("AdminShell");
    expect(shell).toContain("aggregate-only");
    expect(shell).toContain("ADMIN_PANEL_ENABLED=false");
  });

  it("does not expose sensitive user details on admin pages", () => {
    const source = [
      "src/app/dashboard/admin/page.tsx",
      "src/app/dashboard/admin/users/page.tsx",
      "src/app/dashboard/admin/products/page.tsx",
      "src/app/dashboard/admin/content/page.tsx",
      "src/app/dashboard/admin/renders/page.tsx",
      "src/app/dashboard/admin/system/page.tsx",
      "src/app/dashboard/admin/audit-logs/page.tsx",
      "src/app/dashboard/admin/settings/page.tsx",
    ].map((f) => readFileSync(f, "utf8")).join("\n");

    expect(source).not.toContain("@gmail");
    expect(source).not.toContain("@yahoo");
    expect(source).not.toContain("DATABASE_URL");
    expect(source).not.toContain("outputPath");
    expect(source).not.toContain("/var/lib");
    expect(source).not.toContain("systemctl start");
  });

  it("keeps audit logs in aggregate-only mode with runbook fallback", () => {
    const auditPage = readFileSync("src/app/dashboard/admin/audit-logs/page.tsx", "utf8");
    expect(auditPage).toContain("Aggregate Only");
    expect(auditPage).toContain("admin-observability-ops-center");
    expect(auditPage).not.toContain("stack");
  });
});
