import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("background color selector safety", () => {
  it("uses allowlisted values only", () => {
    const provider = readFileSync("src/components/theme/ThemeProvider.tsx", "utf8");
    expect(provider).toContain('"default"');
    expect(provider).toContain('"slate"');
    expect(provider).toContain('"indigo"');
    expect(provider).toContain('"emerald"');
    expect(provider).toContain('"amber"');
    expect(provider).toContain('"rose"');
    expect(provider).toContain('"zinc"');
    expect(provider).toContain('"neutral"');
  });

  it("does not include arbitrary color input fields", () => {
    const select = readFileSync("src/components/theme/BackgroundColorSelect.tsx", "utf8");
    expect(select).not.toMatch(/type=\"color\"/);
    expect(select).not.toMatch(/rgb\(/i);
    expect(select).not.toMatch(/hsl\(/i);
    expect(select).not.toMatch(/#[0-9a-f]{3,8}/i);
  });
});
