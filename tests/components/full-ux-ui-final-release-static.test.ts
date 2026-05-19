import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("full ux/ui final release safety", () => {
  it("settings includes theme toggle", () => {
    const content = readFileSync("src/components/settings/SettingsForm.tsx", "utf8");
    expect(content).toContain("ThemeToggle");
  });

  it("hyperframes ops page includes safe wording", () => {
    const content = readFileSync("src/app/dashboard/hyperframes/ops/page.tsx", "utf8");
    expect(content).toMatch(/safe|ปลอดภัย|read-only/i);
  });
});
