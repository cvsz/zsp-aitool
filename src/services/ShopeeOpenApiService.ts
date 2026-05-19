import { getShopeeOpenApiConfig, toShopeeOpenApiSafeStatus, validateShopeeOpenApiConfig } from "@/lib/shopee/open-api-config";
import { ShopeeOpenApiClient, type ShopeeClientResult } from "@/services/shopee-open-api-client";

export type ShopeeOpenApiServiceStatus = {
  integration: ReturnType<typeof toShopeeOpenApiSafeStatus>;
  mode: "DISABLED" | "FOUNDATION_ONLY" | "MISCONFIGURED";
};

export class ShopeeOpenApiService {
  constructor(private readonly client?: ShopeeOpenApiClient) {}

  getStatus(source: NodeJS.ProcessEnv = process.env): ShopeeOpenApiServiceStatus {
    const config = getShopeeOpenApiConfig(source);
    const validation = validateShopeeOpenApiConfig(config);

    if (!config.enabled) return { integration: toShopeeOpenApiSafeStatus(config), mode: "DISABLED" };
    if (!validation.ok) return { integration: toShopeeOpenApiSafeStatus(config), mode: "MISCONFIGURED" };

    return { integration: toShopeeOpenApiSafeStatus(config), mode: "FOUNDATION_ONLY" };
  }

  async checkConnectivity(source: NodeJS.ProcessEnv = process.env): Promise<ShopeeClientResult> {
    const status = this.getStatus(source);
    if (status.mode === "DISABLED") return { ok: false, code: "DISABLED", message: "Shopee Open API integration is disabled" };
    if (status.mode === "MISCONFIGURED") return { ok: false, code: "MISCONFIGURED", message: "Shopee Open API integration is misconfigured" };
    if (!this.client) return { ok: false, code: "NETWORK_ERROR", message: "No HTTP client configured" };

    const config = getShopeeOpenApiConfig(source);
    return this.client.getStatusPing(`${config.apiBaseUrl}/health`);
  }
}
