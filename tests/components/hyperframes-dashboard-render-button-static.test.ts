import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("hyperframes dashboard render button static checks", () => {
  it("includes guarded render enqueue UX and no path leakage", () => {
    const page = readFileSync("src/app/dashboard/hyperframes/page.tsx", "utf8");

    expect(page).toContain("Render now");
    expect(page).toContain("/api/hyperframes/render");
    expect(page).toContain("/dashboard/hyperframes/renders");
    expect(page).toContain("hasValidComposition");
    expect(page).not.toContain("dangerouslySetInnerHTML");
    expect(page).not.toContain("outputPath");
    expect(page).not.toContain("/var/lib");
  });
});
