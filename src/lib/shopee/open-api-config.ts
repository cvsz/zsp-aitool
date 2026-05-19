export type ShopeeOpenApiEnvironment = "sandbox" | "live";

export type ShopeeOpenApiConfig = {
  enabled: boolean;
  environment: ShopeeOpenApiEnvironment;
  partnerId?: string;
  partnerKey?: string;
  apiBaseUrl?: string;
  authBaseUrl?: string;
  redirectUrl?: string;
  webhookSecret?: string;
};

export type ShopeeOpenApiSafeStatus = {
  enabled: boolean;
  environment: ShopeeOpenApiEnvironment;
  setupRequired: boolean;
  docsRequired: boolean;
  configured: {
    partnerId: boolean;
    partnerKey: boolean;
    apiBaseUrl: boolean;
    authBaseUrl: boolean;
    redirectUrl: boolean;
    webhookSecret: boolean;
  };
};

const REQUIRED_WHEN_ENABLED: Array<keyof Pick<ShopeeOpenApiConfig, "partnerId" | "partnerKey" | "apiBaseUrl" | "authBaseUrl" | "redirectUrl" | "webhookSecret">> = [
  "partnerId",
  "partnerKey",
  "apiBaseUrl",
  "authBaseUrl",
  "redirectUrl",
  "webhookSecret",
];

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return value.trim().toLowerCase() === "true";
}

function parseEnvironment(value: string | undefined): ShopeeOpenApiEnvironment {
  return value === "live" ? "live" : "sandbox";
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getShopeeOpenApiConfig(source: NodeJS.ProcessEnv = process.env): ShopeeOpenApiConfig {
  return {
    enabled: parseBoolean(source.SHOPEE_OPEN_API_ENABLED, false),
    environment: parseEnvironment(source.SHOPEE_OPEN_API_ENV),
    partnerId: normalizeOptional(source.SHOPEE_PARTNER_ID),
    partnerKey: normalizeOptional(source.SHOPEE_PARTNER_KEY),
    apiBaseUrl: normalizeOptional(source.SHOPEE_API_BASE_URL),
    authBaseUrl: normalizeOptional(source.SHOPEE_AUTH_BASE_URL),
    redirectUrl: normalizeOptional(source.SHOPEE_REDIRECT_URL),
    webhookSecret: normalizeOptional(source.SHOPEE_WEBHOOK_SECRET),
  };
}

export function validateShopeeOpenApiConfig(config: ShopeeOpenApiConfig): { ok: true } | { ok: false; code: "SHOPEE_OPEN_API_MISCONFIGURED"; missing: string[] } {
  if (!config.enabled) return { ok: true };
  const missing = REQUIRED_WHEN_ENABLED.filter((key) => !config[key]);
  if (missing.length > 0) return { ok: false, code: "SHOPEE_OPEN_API_MISCONFIGURED", missing };
  return { ok: true };
}

export function toShopeeOpenApiSafeStatus(config: ShopeeOpenApiConfig): ShopeeOpenApiSafeStatus {
  const validation = validateShopeeOpenApiConfig(config);
  return {
    enabled: config.enabled,
    environment: config.environment,
    setupRequired: validation.ok ? false : true,
    docsRequired: true,
    configured: {
      partnerId: Boolean(config.partnerId),
      partnerKey: Boolean(config.partnerKey),
      apiBaseUrl: Boolean(config.apiBaseUrl),
      authBaseUrl: Boolean(config.authBaseUrl),
      redirectUrl: Boolean(config.redirectUrl),
      webhookSecret: Boolean(config.webhookSecret),
    },
  };
}
