import { describe, expect, it, vi } from "vitest";
import { ShopeeOpenApiService } from "@/services/ShopeeOpenApiService";

describe("ShopeeOpenApiService", () => {
  it("returns DISABLED when feature flag is off", async () => {
    const request = vi.fn();
    const service = new ShopeeOpenApiService({ httpClient: { request }, env: { SHOPEE_OPEN_API_ENABLED: "false" } });
    const result = await service.getStatus();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.code).toBe("DISABLED");
    expect(request).not.toHaveBeenCalled();
  });

  it("returns FOUNDATION_ONLY when signing is unsupported", async () => {
    const service = new ShopeeOpenApiService({ httpClient: { request: vi.fn() }, env: {
      SHOPEE_OPEN_API_ENABLED: "true", SHOPEE_OPEN_API_ENV: "sandbox", SHOPEE_PARTNER_ID: "1000", SHOPEE_PARTNER_KEY: "x", SHOPEE_API_BASE_URL: "https://api", SHOPEE_AUTH_BASE_URL: "https://auth", SHOPEE_REDIRECT_URL: "https://redirect", SHOPEE_WEBHOOK_SECRET: "hook"
    } });
    const result = await service.getStatus();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.code).toBe("FOUNDATION_ONLY");
  });

  it("returns MANAGED_SELLER_BLOCKED when eligibility is blocked", async () => {
    const service = new ShopeeOpenApiService({ httpClient: { request: vi.fn() }, env: {
      SHOPEE_OPEN_API_ENABLED: "true", SHOPEE_OPEN_API_ENV: "sandbox", SHOPEE_OPEN_API_ELIGIBILITY: "blocked", SHOPEE_PARTNER_ID: "1000", SHOPEE_PARTNER_KEY: "x", SHOPEE_API_BASE_URL: "https://api", SHOPEE_AUTH_BASE_URL: "https://auth", SHOPEE_REDIRECT_URL: "https://redirect", SHOPEE_WEBHOOK_SECRET: "hook"
    } });
    const result = await service.getStatus();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.code).toBe("MANAGED_SELLER_BLOCKED");
  });
});
