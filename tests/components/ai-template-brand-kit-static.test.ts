import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("ai template and brand kit static safety", () => {
  it("contains brand kit fields and safety disclosure in UI", () => {
    const page = readFileSync("src/app/dashboard/templates/page.tsx", "utf8");
    expect(page).toContain("brandColors");
    expect(page).toContain("fontPreference");
    expect(page).toContain("logoUrl");
    expect(page).toContain("watermarkText");
    expect(page).toContain("defaultCTA");
    expect(page).toContain("defaultAspectRatio");
  });

  it("keeps generator guardrails visible and avoids local path leakage", () => {
    const generator = readFileSync("src/components/ai/ContentGeneratorForm.tsx", "utf8");
    expect(generator).toContain("ห้ามแต่งรีวิว/สเปก");
    expect(generator).toContain("ห้ามอ้างรายได้การันตี");
    expect(generator).not.toContain("/var/lib");
    expect(generator).not.toContain("DATABASE_URL");
  });
});
