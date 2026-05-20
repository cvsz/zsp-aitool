import { describe, expect, it } from "vitest";
import { shopeeAffiliateIngestionService } from "@/services/ShopeeAffiliateIngestionService";

describe("ShopeeAffiliateIngestionService", () => {
  it("creates pending review for valid manual URLs", () => {
    const out = shopeeAffiliateIngestionService.validateManualDraft({
      affiliateUrl: "https://affiliate.shopee.co.th/offer",
      productUrl: "https://shopee.co.th/product/1/2",
    });
    expect(out.status).toBe("pending_review");
  });

  it("rejects unsafe manual URLs", () => {
    const out = shopeeAffiliateIngestionService.validateManualDraft({
      affiliateUrl: "http://evil.com",
      productUrl: "https://shopee.co.th/product/1/2",
    });
    expect(out.status).toBe("rejected");
  });

  it("rejects csv rows with formula and enforces queue classification", () => {
    const out = shopeeAffiliateIngestionService.previewCsv("affiliate_url,product_url,title\n=CMD(),https://shopee.co.th/a,b\nhttps://affiliate.shopee.co.th/x,https://shopee.co.th/y,ok");
    expect(out.rejectedRowIndexes).toEqual([1]);
    expect(out.queueItems[0]?.source).toBe("csv");
  });
});
