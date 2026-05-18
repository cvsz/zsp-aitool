import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("render history static safety", () => {
  it("does not expose unsafe UI patterns", () => {
    const page = readFileSync("src/app/dashboard/hyperframes/renders/page.tsx", "utf8");
    const card = readFileSync("src/components/hyperframes/RenderJobCard.tsx", "utf8");
    const sidebar = readFileSync("src/components/layout/Sidebar.tsx", "utf8");

    expect(page).not.toContain("dangerouslySetInnerHTML");
    expect(page).not.toContain("/var/lib");
    expect(card).not.toContain("outputPath");
    expect(card).toContain("downloadUrl");
    expect(card).toContain("ลองใหม่");
    expect(sidebar).toContain("/dashboard/hyperframes/renders");
    expect(page).toContain("อัปเกรดแพ็กเกจ");
  });
});
