import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const adminAnalytics = readFileSync(path.join(process.cwd(), "src/app/dashboard/admin/analytics/page.tsx"), "utf8");
const dashboardPage = readFileSync(path.join(process.cwd(), "src/app/dashboard/page.tsx"), "utf8");

describe("growth analytics and feedback static", () => {
  it("keeps aggregate-only and no sensitive markers", () => {
    ["aggregate-only"].forEach((token) => expect(adminAnalytics).toContain(token));
    ["outputPath", "DATABASE_URL", "/var/lib", "dangerouslySetInnerHTML"].forEach((token) => {
      expect(adminAnalytics).not.toContain(token);
      expect(dashboardPage).not.toContain(token);
    });
  });

  it("does not include external tracking sdk markers", () => {
    ["googletagmanager", "fbq(", "tiktok"].forEach((token) => {
      expect(adminAnalytics.toLowerCase()).not.toContain(token);
      expect(dashboardPage.toLowerCase()).not.toContain(token);
    });
  });
});
