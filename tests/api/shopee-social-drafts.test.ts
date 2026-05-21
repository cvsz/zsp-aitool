import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("shopee social drafts routes", () => {
  it("declares required endpoints", () => {
    const files = [
      "src/app/api/integrations/shopee/social-drafts/route.ts",
      "src/app/api/integrations/shopee/social-drafts/[id]/route.ts",
      "src/app/api/integrations/shopee/social-drafts/[id]/copy/route.ts",
      "src/app/api/integrations/shopee/social-drafts/[id]/archive/route.ts",
    ];
    for (const file of files) expect(fs.existsSync(file)).toBe(true);
  });
});
