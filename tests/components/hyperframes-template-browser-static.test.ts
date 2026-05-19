import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("hyperframes template browser static safety", () => {
  it("uses next/image and avoids raw img or dangerous html", () => {
    const file = readFileSync("src/components/hyperframes/HyperframesTemplateBrowser.tsx", "utf8");

    expect(file).toContain('from "next/image"');
    expect(file).not.toContain("<img");
    expect(file).not.toContain("dangerouslySetInnerHTML");
  });
});
