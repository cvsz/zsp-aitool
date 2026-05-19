import { describe, expect, it, vi } from "vitest";

import { ShopeeOpenApiService } from "@/services/ShopeeOpenApiService";
import { ShopeeOpenApiClient } from "@/services/shopee-open-api-client";

describe("ShopeeOpenApiService", () => {
  it("returns DISABLED mode when flag is false", () => {
    const service = new ShopeeOpenApiService();
    expect(service.getStatus({ SHOPEE_OPEN_API_ENABLED: "false" }).mode).toBe("DISABLED");
  });

  it("redacts secrets from client errors", async () => {
    const httpClient = { request: vi.fn().mockRejectedValue(new Error("failed SHOPEE_PARTNER_KEY=abc access_token=secret refresh_token=zzz")) };
    const client = new ShopeeOpenApiClient(httpClient);
    const res = await client.getStatusPing("https://example.com");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.message).not.toContain("abc");
      expect(res.message).not.toContain("secret");
      expect(res.message).not.toContain("zzz");
    }
  });

  it("does not call network when disabled", async () => {
    const httpClient = { request: vi.fn() };
    const service = new ShopeeOpenApiService(new ShopeeOpenApiClient(httpClient));
    const res = await service.checkConnectivity({ SHOPEE_OPEN_API_ENABLED: "false" });
    expect(res.ok).toBe(false);
    expect(httpClient.request).not.toHaveBeenCalled();
  });
});
