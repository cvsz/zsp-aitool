import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("shopee social drafts dashboard static", () => {
  it("contains social draft workflow controls", () => {
    const source = fs.readFileSync("src/components/shopee/ShopeeAffiliateControlCenter.tsx", "utf8");
    expect(source).toContain("createSocialDraft");
    expect(source).toContain("copySocialDraft");
    expect(source).toContain("socialChannel");
  });
});
