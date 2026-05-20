import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("mobile nav coverage", () => {
  it("covers capture + generation + OCR + similar + settings + hyperframes flows", () => {
    const content = readFileSync("src/components/layout/MobileNav.tsx", "utf8");
    [
      "/dashboard/products/new",
      "/dashboard/generator",
      "/dashboard/ocr",
      "/dashboard/similar",
      "/dashboard/settings",
      "/dashboard/hyperframes",
    ].forEach((href) => {
      expect(content).toContain(href);
    });
  });
});
