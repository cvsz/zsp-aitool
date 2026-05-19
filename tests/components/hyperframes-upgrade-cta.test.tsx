import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("HyperFrames upgrade CTA", () => {
  it("keeps upgrade CTA copy available in render surfaces", () => {
    const rendersPage = readFileSync("src/app/dashboard/hyperframes/renders/page.tsx", "utf8");
    const dashboardPage = readFileSync("src/app/dashboard/hyperframes/page.tsx", "utf8");

    expect(rendersPage).toContain("อัปเกรดแพ็กเกจ");
    expect(dashboardPage).toContain("Render now");
    expect(dashboardPage).not.toContain("dangerouslySetInnerHTML");
  });
});
