import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("theme mode static", () => {
  it("includes thai labels for light/dark/system", () => {
    const content = readFileSync("src/components/theme/ThemeToggle.tsx", "utf8");
    expect(content).toContain("สว่าง");
    expect(content).toContain("มืด");
    expect(content).toContain("ตามระบบ");
  });
});
