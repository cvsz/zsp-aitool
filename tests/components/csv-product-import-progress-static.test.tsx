import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("csv import progress ui static", () => {
  it("dashboard component still exists for integrations", () => {
    const file = readFileSync("src/components/shopee/ShopeeAffiliateControlCenter.tsx", "utf8");
    expect(file).toContain("Shopee Affiliate Control Center");
  });
});
