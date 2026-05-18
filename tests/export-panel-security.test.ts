import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("ExportPanel source safety", () => {
  it("does not use dangerous DOM HTML reinterpretation APIs", () => {
    const source = readFileSync(join(process.cwd(), "src/components/export/ExportPanel.tsx"), "utf8");

    const forbiddenPatterns = ["innerHTML", "outerHTML", "insertAdjacentHTML", "dangerouslySetInnerHTML", "DOMParser"];

    for (const pattern of forbiddenPatterns) {
      expect(source).not.toContain(pattern);
    }
  });

  it("does not read textContent or innerText for export content", () => {
    const source = readFileSync(join(process.cwd(), "src/components/export/ExportPanel.tsx"), "utf8");

    expect(source).not.toContain("textContent");
    expect(source).not.toContain("innerText");
  });
});
