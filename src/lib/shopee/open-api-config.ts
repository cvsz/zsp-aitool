export type ShopeeOpenApiEnvironment = "sandbox" | "live";

const DEFAULT_SHOPEE_AFFILIATE_AUTH_URL = "https://affiliate.shopee.co.th/";
const ALLOWED_AFFILIATE_AUTH_HOST = "affiliate.shopee.co.th";

export type ShopeeOpenApiRawEnv = {
  SHOPEE_OPEN_API_ENABLED?: string;
  SHOPEE_OPEN_API_ENV?: string;
  SHOPEE_OPEN_API_FOUNDATION_READY?: string;
  SHOPEE_OPEN_API_ELIGIBILITY?: string;
  SHOPEE_PARTNER_ID?: string;
  SHOPEE_PARTNER_KEY?: string;
  SHOPEE_API_BASE_URL?: string;
  SHOPEE_AUTH_BASE_URL?: string;
  SHOPEE_REDIRECT_URL?: string;
  SHOPEE_WEBHOOK_SECRET?: string;
  SHOPEE_AFFILIATE_AUTH_URL?: string;
};

export type ShopeeOpenApiConfig = {
  enabled: boolean;
  environment: ShopeeOpenApiEnvironment;
  foundationReady: boolean;
  eligibility: "unknown" | "blocked" | "eligible";
  partnerId: string | null;
  partnerKey: string | null;
  apiBaseUrl: string | null;
  authBaseUrl: string | null;
  redirectUrl: string | null;
  webhookSecret: string | null;
  affiliateAuthUrl: string | null;
};

export class ShopeeOpenApiConfigError extends Error {
  readonly code = "SHOPEE_OPEN_API_CONFIG_INVALID";
  constructor(message: string, readonly missingFields: string[]) {
    super(message);
    this.name = "ShopeeOpenApiConfigError";
  }
}

const REQUIRED_WHEN_ENABLED: Array<keyof ShopeeOpenApiRawEnv> = [
  "SHOPEE_PARTNER_ID",
  "SHOPEE_PARTNER_KEY",
  "SHOPEE_API_BASE_URL",
  "SHOPEE_AUTH_BASE_URL",
  "SHOPEE_REDIRECT_URL",
  "SHOPEE_WEBHOOK_SECRET"
];

function normalizeBoolean(raw: string | undefined): boolean {
  return raw?.trim().toLowerCase() === "true";
}

function normalizeEnvironment(raw: string | undefined): ShopeeOpenApiEnvironment {
  return raw?.trim().toLowerCase() === "live" ? "live" : "sandbox";
}

function normalizeValue(raw: string | undefined): string | null {
  const value = raw?.trim();
  return value ? value : null;
}

function normalizeAffiliateAuthUrl(raw: string | undefined): string | null {
  const value = normalizeValue(raw) ?? DEFAULT_SHOPEE_AFFILIATE_AUTH_URL;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.hostname !== ALLOWED_AFFILIATE_AUTH_HOST) return null;
    parsed.username = "";
    parsed.password = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

export function loadShopeeOpenApiConfig(env: ShopeeOpenApiRawEnv = process.env as ShopeeOpenApiRawEnv): ShopeeOpenApiConfig {
  const enabled = normalizeBoolean(env.SHOPEE_OPEN_API_ENABLED);
  const environment = normalizeEnvironment(env.SHOPEE_OPEN_API_ENV);
  const foundationReady = normalizeBoolean(env.SHOPEE_OPEN_API_FOUNDATION_READY);
  const eligibilityRaw = env.SHOPEE_OPEN_API_ELIGIBILITY?.trim().toLowerCase();
  const eligibility = eligibilityRaw === "eligible" || eligibilityRaw === "blocked" ? eligibilityRaw : "unknown";

  const config: ShopeeOpenApiConfig = {
    enabled,
    environment,
    foundationReady,
    eligibility,
    partnerId: normalizeValue(env.SHOPEE_PARTNER_ID),
    partnerKey: normalizeValue(env.SHOPEE_PARTNER_KEY),
    apiBaseUrl: normalizeValue(env.SHOPEE_API_BASE_URL),
    authBaseUrl: normalizeValue(env.SHOPEE_AUTH_BASE_URL),
    redirectUrl: normalizeValue(env.SHOPEE_REDIRECT_URL),
    webhookSecret: normalizeValue(env.SHOPEE_WEBHOOK_SECRET),
    affiliateAuthUrl: normalizeAffiliateAuthUrl(env.SHOPEE_AFFILIATE_AUTH_URL)
  };

  if (!enabled) return config;

  const missingFields = REQUIRED_WHEN_ENABLED.filter((field) => !normalizeValue(env[field]));
  if (missingFields.length > 0) {
    throw new ShopeeOpenApiConfigError("Shopee Open API is enabled but required configuration is missing", missingFields);
  }

  return config;
}

export function toShopeeOpenApiSafeStatus(config: ShopeeOpenApiConfig) {
  return {
    enabled: config.enabled,
    environment: config.environment,
    foundationReady: config.foundationReady,
    eligibility: config.eligibility,
    configured: Boolean(config.partnerId && config.apiBaseUrl && config.authBaseUrl && config.redirectUrl),
    setupRequired: !config.enabled || !config.partnerId || !config.apiBaseUrl || !config.authBaseUrl || !config.redirectUrl,
    docsRequired: true,
    partnerId: config.partnerId ? `***${config.partnerId.slice(-4)}` : null,
    hasPartnerKey: Boolean(config.partnerKey),
    hasWebhookSecret: Boolean(config.webhookSecret),
    authUrlAvailable: false,
    callbackAvailable: false,
    affiliateAuthUrl: config.affiliateAuthUrl,
    affiliateAuthUrlAvailable: Boolean(config.affiliateAuthUrl)
  };
}
