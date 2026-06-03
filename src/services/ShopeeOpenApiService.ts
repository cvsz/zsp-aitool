import { loadShopeeOpenApiConfig, ShopeeOpenApiConfigError, toShopeeOpenApiSafeStatus, type ShopeeOpenApiRawEnv } from "@/lib/shopee/open-api-config";
import { buildShopeeSignature, ShopeeSignatureUnsupportedError } from "@/lib/shopee/signature";
import { toSafeShopeeError, type HttpClient } from "@/services/shopee-open-api-client";

export type ShopeeOpenApiStatusResult =
  | { ok: true; code: "DISABLED" | "FOUNDATION_ONLY" | "SANDBOX_READY" | "MISSING_CREDENTIALS" | "MANAGED_SELLER_BLOCKED" | "LIVE_READY"; data: ReturnType<typeof toShopeeOpenApiSafeStatus> }
  | { ok: false; code: "CONFIG_ERROR" | "UNSUPPORTED" | "CLIENT_ERROR"; message: string; details?: unknown };

export class ShopeeOpenApiService {
  constructor(private readonly dependencies: { httpClient: HttpClient; env?: ShopeeOpenApiRawEnv }) {}

  async getStatus(): Promise<ShopeeOpenApiStatusResult> {
    try {
      const config = loadShopeeOpenApiConfig(this.dependencies.env);
      const safeStatus = toShopeeOpenApiSafeStatus(config);
      if (!config.enabled) return { ok: true, code: "DISABLED", data: safeStatus };
      if (config.eligibility === "blocked") return { ok: true, code: "MANAGED_SELLER_BLOCKED", data: safeStatus };

      try {
        buildShopeeSignature({ path: "/api/v2/auth/token/get", timestamp: Math.floor(Date.now() / 1000) });
      } catch (error) {
        if (error instanceof ShopeeSignatureUnsupportedError) {
          return { ok: true, code: "FOUNDATION_ONLY", data: safeStatus };
        }
        throw error;
      }

      if (!safeStatus.configured || !safeStatus.hasPartnerKey || !safeStatus.hasWebhookSecret) {
        return { ok: true, code: "MISSING_CREDENTIALS", data: safeStatus };
      }

      if (config.environment === "sandbox") return { ok: true, code: "SANDBOX_READY", data: safeStatus };
      return { ok: true, code: config.foundationReady ? "LIVE_READY" : "FOUNDATION_ONLY", data: safeStatus };
    } catch (error) {
      if (error instanceof ShopeeOpenApiConfigError) {
        return { ok: false, code: "CONFIG_ERROR", message: error.message, details: { missingFields: error.missingFields } };
      }
      const safeError = toSafeShopeeError(error);
      return { ok: false, code: "CLIENT_ERROR", message: safeError.message };
    }
  }
}
