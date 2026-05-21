import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("db schema drift check script (static)", () => {
  const script = readFileSync("scripts/db/check-user-settings-schema.ts", "utf8");

  it("checks User.planTier and core UserSetting columns", () => {
    expect(script).toContain("planTier");
    expect(script).toContain("PlanTier");
    expect(script).toContain("brandColors");
    expect(script).toContain("fontPreference");
    expect(script).toContain("logoUrl");
    expect(script).toContain("watermarkText");
    expect(script).toContain("defaultAspectRatio");
    expect(script).toContain("defaultCTA");
    expect(script).toContain("information_schema.columns");
  });

  it("does not print DATABASE_URL or obvious secrets", () => {
    expect(script).not.toContain("process.env.DATABASE_URL");
    expect(script).not.toContain("DATABASE_URL=");
    expect(script).not.toContain("apiKey");
    expect(script).not.toContain("token=");
  });

  it("package.json includes db:schema-drift-check script", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["db:schema-drift-check"]).toBe(
      "tsx scripts/db/check-user-settings-schema.ts",
    );
  });
});
