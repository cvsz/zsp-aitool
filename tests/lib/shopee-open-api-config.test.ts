import { describe, expect, it } from "vitest";
import { loadShopeeOpenApiConfig, ShopeeOpenApiConfigError, toShopeeOpenApiSafeStatus } from "@/lib/shopee/open-api-config";

describe("shopee open api config", () => {
  it("returns disabled config safely by default", () => {
    const config = loadShopeeOpenApiConfig({ SHOPEE_OPEN_API_ENABLED: "false" });
    const safe = toShopeeOpenApiSafeStatus(config);
    expect(config.enabled).toBe(false);
    expect(safe.hasPartnerKey).toBe(false);
    expect(safe.foundationReady).toBe(false);
    expect(safe.eligibility).toBe("unknown");
  });

  it("throws controlled error only when enabled and missing required env", () => {
    expect(() => loadShopeeOpenApiConfig({ SHOPEE_OPEN_API_ENABLED: "true", SHOPEE_OPEN_API_ENV: "sandbox" })).toThrow(ShopeeOpenApiConfigError);
  });

  it("redacts partner id and never returns secret values", () => {
    const config = loadShopeeOpenApiConfig({
      SHOPEE_OPEN_API_ENABLED: "true",
      SHOPEE_OPEN_API_ENV: "live",
      SHOPEE_PARTNER_ID: "12345678",
      SHOPEE_PARTNER_KEY: "secret-key",
      SHOPEE_API_BASE_URL: "https://sandbox.example.com",
      SHOPEE_AUTH_BASE_URL: "https://sandbox-auth.example.com",
      SHOPEE_REDIRECT_URL: "https://app.example.com/callback",
      SHOPEE_WEBHOOK_SECRET: "secret-hook"
    });
    const safe = toShopeeOpenApiSafeStatus(config);
    expect(safe.partnerId).toBe("***5678");
    expect(JSON.stringify(safe)).not.toContain("secret-key");
    expect(JSON.stringify(safe)).not.toContain("secret-hook");
  });
});
