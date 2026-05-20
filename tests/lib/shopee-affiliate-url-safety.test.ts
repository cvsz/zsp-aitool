import { describe, expect, it } from "vitest";
import { isAllowedShopeeAffiliateUrl } from "@/lib/shopee-affiliate-url-safety";

describe("shopee affiliate url safety", () => {
  it("accepts affiliate portal https url", () => {
    expect(isAllowedShopeeAffiliateUrl("https://affiliate.shopee.co.th/")).toBe(true);
  });

  it("accepts safe shopee product link", () => {
    expect(isAllowedShopeeAffiliateUrl("https://shopee.co.th/product/123/456")).toBe(true);
  });

  it("rejects non-https and unsafe schemes/hosts", () => {
    const blocked = [
      "http://affiliate.shopee.co.th/",
      "javascript:alert(1)",
      "data:text/html,1",
      "file:///etc/passwd",
      "blob:https://shopee.co.th/abc",
      "https://localhost:3001/a",
      "https://192.168.1.7/test",
      "https://10.1.1.1/test",
      "https://[::1]/test",
      "https://evil.com/x",
      "https://affiliate.shopee.co.th/?redirect=https://evil.com",
    ];

    for (const value of blocked) {
      expect(isAllowedShopeeAffiliateUrl(value)).toBe(false);
    }
  });
});
