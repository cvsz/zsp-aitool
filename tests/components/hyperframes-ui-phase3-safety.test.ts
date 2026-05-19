import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("hyperframes ui phase 3 safety", () => {
  it("render history UI omits sensitive path data", () => {
    const page = readFileSync("src/app/dashboard/hyperframes/renders/page.tsx", "utf8");
    const card = readFileSync("src/components/hyperframes/RenderJobCard.tsx", "utf8");
    expect(page).not.toContain("outputPath");
    expect(page).not.toContain("/var/lib");
    expect(card).not.toContain("outputPath");
    expect(card).toContain("downloadUrl");
    expect(card).toContain("/api/hyperframes/render/");
  });

  it("ops UI does not expose systemctl controls or secrets", () => {
    const ops = readFileSync("src/app/dashboard/hyperframes/ops/page.tsx", "utf8");
    const queue = readFileSync("src/app/dashboard/hyperframes/ops/queue/page.tsx", "utf8");
    [ops, queue].forEach((source) => {
      expect(source).not.toContain("systemctl start");
      expect(source).not.toContain("systemctl stop");
      expect(source).not.toContain("DATABASE_URL");
      expect(source).not.toContain("outputPath");
      expect(source).not.toContain("/var/lib");
    });
  });

  it("safe error truncation helper exists and avoids dangerous html APIs", () => {
    const safe = readFileSync("src/components/hyperframes/SafeErrorText.tsx", "utf8");
    const renderPage = readFileSync("src/app/dashboard/hyperframes/renders/page.tsx", "utf8");
    const batchPage = readFileSync("src/app/dashboard/hyperframes/batch/page.tsx", "utf8");
    expect(safe).toContain("truncateSafeErrorText");
    expect(renderPage).not.toContain("dangerouslySetInnerHTML");
    expect(batchPage).toContain("ความปลอดภัยคิว");
  });
});
