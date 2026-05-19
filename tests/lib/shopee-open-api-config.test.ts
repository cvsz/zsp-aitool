import { describe, expect, it } from "vitest";

import { getShopeeOpenApiConfig, toShopeeOpenApiSafeStatus, validateShopeeOpenApiConfig } from "@/lib/shopee/open-api-config";
import { signShopeeOpenApiRequest, ShopeeOpenApiSignatureUnsupportedError } from "@/lib/shopee/signature";

describe("shopee open api config", () => {
  it("returns safe disabled status by default", () => {
    const config = getShopeeOpenApiConfig({});
    const status = toShopeeOpenApiSafeStatus(config);
    expect(status.enabled).toBe(false);
    expect(status.setupRequired).toBe(false);
  });

  it("requires fields only when enabled", () => {
    const config = getShopeeOpenApiConfig({ SHOPEE_OPEN_API_ENABLED: "true" });
    const validation = validateShopeeOpenApiConfig(config);
    expect(validation.ok).toBe(false);
    if (!validation.ok) expect(validation.missing.length).toBeGreaterThan(1);
  });

  it("signature safely refuses unsupported algorithm", () => {
    expect(() => signShopeeOpenApiRequest({ path: "/api/v2/shop/get_shop_info", timestamp: Date.now(), partnerId: "1" })).toThrow(ShopeeOpenApiSignatureUnsupportedError);
  });
});
