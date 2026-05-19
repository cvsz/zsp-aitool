export type HttpClientResponse<T = unknown> = {
  status: number;
  data: T;
};

export type HttpClient = {
  request<T = unknown>(input: { method: "GET" | "POST"; url: string; headers?: Record<string, string>; body?: unknown; timeoutMs?: number }): Promise<HttpClientResponse<T>>;
};

export type ShopeeClientError = {
  code: string;
  message: string;
  status: number;
};

const SECRET_PATTERNS = [/partner[_-]?key/gi, /webhook[_-]?secret/gi, /access[_-]?token/gi, /refresh[_-]?token/gi];

function redactSecrets(text: string): string {
  let safe = text;
  for (const pattern of SECRET_PATTERNS) {
    safe = safe.replace(pattern, "[REDACTED]");
  }
  return safe;
}

export function toSafeShopeeError(error: unknown): ShopeeClientError {
  if (error instanceof Error) {
    return { code: "SHOPEE_CLIENT_ERROR", message: redactSecrets(error.message), status: 502 };
  }
  return { code: "SHOPEE_CLIENT_ERROR", message: "Unexpected Shopee Open API client error", status: 502 };
}
