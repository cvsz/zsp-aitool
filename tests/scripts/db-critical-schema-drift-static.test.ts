import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("critical db schema drift coverage (static)", () => {
  it("drift script checks required production tables and indexes", () => {
    const script = readFileSync("scripts/db/check-user-settings-schema.ts", "utf8");

    expect(script).toContain("table_name = 'User'");
    expect(script).toContain("table_name = 'Product'");
    expect(script).toContain("table_name = 'AffiliateLink'");
    expect(script).toContain("table_name = 'UserSetting'");
    expect(script).toContain("table_name = 'APIUsageLog'");
    expect(script).toContain("table_name = 'ShopeeAffiliateIngestion'");
    expect(script).toContain("table_name = 'ShopeeAffiliateSocialDraft'");
    expect(script).toContain("table_name = 'HyperFrameRenderJob'");
    expect(script).toContain("table_name = 'ContentTemplate'");
    expect(script).toContain("table_name = 'OCRJob'");
    expect(script).toContain("User_email_key");
    expect(script).toContain("Product_userId_originalUrl_key");
  });

  it("start.sh runs db drift check before/after runtime checks", () => {
    const startScript = readFileSync("start.sh", "utf8");
    expect(startScript).toContain("run npm run db:schema-drift-check");
    expect(startScript).toContain("DB_SCHEMA_DRIFT_CHECK_PLAN_TIER_GUARD=true");
  });

  it("runbook documents non-destructive repair policy", () => {
    const runbook = readFileSync("docs/runbooks/db-schema-drift-repair.md", "utf8");
    expect(runbook).toContain("no-data-loss");
    expect(runbook).toContain("Do not drop tables");
    expect(runbook).toContain("Do not run prisma migrate reset");
    expect(runbook).toContain("User.planTier");
  });
});
