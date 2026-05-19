import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("menu coverage", () => {
  it("sidebar contains main hyperframes admin groups", () => {
    const content = readFileSync("src/components/layout/Sidebar.tsx", "utf8");
    expect(content).toContain('title: "Main"');
    expect(content).toContain('title: "HyperFrames"');
    expect(content).toContain('title: "Admin"');
  });

  it("mobile nav links core feature entries", () => {
    const content = readFileSync("src/components/layout/MobileNav.tsx", "utf8");
    expect(content).toContain("/dashboard");
    expect(content).toContain("/dashboard/products");
    expect(content).toContain("/dashboard/generator");
  });
});
