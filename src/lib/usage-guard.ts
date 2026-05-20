import { applyRateLimit, createRateLimitKey, type RateLimitResult } from "@/lib/rate-limit";

type QuotaInput = {
  request: Request;
  namespace: "ai" | "ocr";
  maxRequestsPerMinute: number;
};

export const enforceUsageQuota = async ({ request, namespace, maxRequestsPerMinute }: QuotaInput): Promise<RateLimitResult> => {
  const windowMs = 60 * 1000;
  const key = createRateLimitKey(request, `usage:${namespace}`);
  return await applyRateLimit(key, maxRequestsPerMinute, windowMs);
};
