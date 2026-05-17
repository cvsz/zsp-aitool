import { createHash } from "node:crypto";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

const now = () => Date.now();

const resolveIp = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
};

const keyHash = (value: string): string => createHash("sha256").update(value).digest("hex").slice(0, 16);

export const createRateLimitKey = (request: Request, namespace: string, subject?: string): string => {
  const ip = resolveIp(request);
  return `${namespace}:${keyHash(ip)}:${subject ?? "anon"}`;
};

export const applyRateLimit = (key: string, max: number, windowMs: number): RateLimitResult => {
  const current = now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= current) {
    const entry = { count: 1, resetAt: current + windowMs };
    store.set(key, entry);

    return {
      allowed: true,
      remaining: Math.max(0, max - 1),
      resetAt: entry.resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  const allowed = existing.count <= max;
  const remaining = Math.max(0, max - existing.count);

  return {
    allowed,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - current) / 1000)),
  };
};
