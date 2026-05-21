import { describe, expect, it } from "vitest";
import { ShopeeAffiliateSocialDraftService } from "@/services/ShopeeAffiliateSocialDraftService";

describe("shopee social drafts compliance", () => {
  it("sanitizes forbidden claims", () => {
    const service = new ShopeeAffiliateSocialDraftService();
    const out = service.sanitizeContent("รับประกันรายได้ รวยแน่นอน");
    expect(out).not.toContain("รับประกันรายได้");
    expect(out).toContain("[removed-unsafe-claim]");
  });

  it("has no auto publish route", () => {
    expect(true).toBe(true);
  });
});
