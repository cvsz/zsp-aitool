export type ShopeeHttpClient = {
  request: (input: { method: "GET" | "POST"; url: string; timeoutMs: number; headers?: Record<string, string>; body?: unknown }) => Promise<{ status: number; data: unknown }>;
};

export type ShopeeClientResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; code: "NETWORK_ERROR" | "TIMEOUT" | "DISABLED" | "MISCONFIGURED"; message: string };

const REDACTION_PATTERNS = [/SHOPEE_PARTNER_KEY=[^\s]+/gi, /SHOPEE_WEBHOOK_SECRET=[^\s]+/gi, /access_token[^\s]*/gi, /refresh_token[^\s]*/gi];

export function redactShopeeErrorMessage(message: string): string {
  return REDACTION_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, "[REDACTED]"), message);
}

export class ShopeeOpenApiClient {
  constructor(private readonly httpClient: ShopeeHttpClient, private readonly timeoutMs = 10_000) {}

  async getStatusPing(url: string): Promise<ShopeeClientResult> {
    try {
      const response = await this.httpClient.request({ method: "GET", url, timeoutMs: this.timeoutMs });
      return { ok: true, status: response.status, data: response.data };
    } catch (error) {
      const message = error instanceof Error ? redactShopeeErrorMessage(error.message) : "Unknown Shopee API error";
      return { ok: false, code: "NETWORK_ERROR", message };
    }
  }
}
