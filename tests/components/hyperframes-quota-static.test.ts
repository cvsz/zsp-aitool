import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("hyperframes quota dashboard static safety", () => {
  it("renders quota labels without outputPath", () => {
    const page = readFileSync("src/app/dashboard/hyperframes/renders/page.tsx", "utf8");
    expect(page).toContain("โควต้ารายเดือนคงเหลือ");
    expect(page).toContain("/api/hyperframes/quota");
    expect(page).not.toContain("outputPath");
  });
});
