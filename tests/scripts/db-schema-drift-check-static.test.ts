import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("db schema drift check script (static)", () => {
  it("checks all required UserSetting columns", () => {
    const script = readFileSync("scripts/db/check-user-settings-schema.ts", "utf8");

    expect(script).toContain("brandColors");
    expect(script).toContain("fontPreference");
    expect(script).toContain("logoUrl");
    expect(script).toContain("watermarkText");
    expect(script).toContain("defaultAspectRatio");
    expect(script).toContain("defaultCTA");
    expect(script).toContain("information_schema.columns");
    expect(script).toContain("table_name = 'UserSetting'");
  });

  it("does not print DATABASE_URL or obvious secrets", () => {
    const script = readFileSync("scripts/db/check-user-settings-schema.ts", "utf8");

    expect(script).not.toContain("process.env.DATABASE_URL");
    expect(script).not.toContain("DATABASE_URL=");
    expect(script).not.toContain("apiKey");
    expect(script).not.toContain("token");
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
