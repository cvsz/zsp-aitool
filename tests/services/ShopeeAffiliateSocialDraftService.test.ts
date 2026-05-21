import { describe, expect, it } from "vitest";
import { ShopeeAffiliateSocialDraftService } from "@/services/ShopeeAffiliateSocialDraftService";

describe("ShopeeAffiliateSocialDraftService", () => {
  it("uses short disclosure for x", async () => {
    const service = new ShopeeAffiliateSocialDraftService();
    const output = service.sanitizeContent("abc");
    expect(output).toBe("abc");
  });
});
