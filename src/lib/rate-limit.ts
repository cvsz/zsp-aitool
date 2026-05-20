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

export const applyRateLimit = async (key: string, max: number, windowMs: number): Promise<RateLimitResult> => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["TTL", key],
        ]),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as Array<{ error?: string; result: any }>;
        const count = Number(data[0]?.result);
        const ttl = Number(data[1]?.result);

        if (!isNaN(count) && !isNaN(ttl)) {
          // If the key was newly created (ttl was -1), set the expiration time.
          if (ttl === -1) {
            await fetch(`${url}/expire/${key}/${Math.ceil(windowMs / 1000)}`, {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            });
          }

          const current = now();
          const resetAt = ttl === -1 ? current + windowMs : current + ttl * 1000;
          const remaining = Math.max(0, max - count);
          const allowed = count <= max;

          return {
            allowed,
            remaining,
            resetAt,
            retryAfterSeconds: Math.max(1, Math.ceil((resetAt - current) / 1000)),
          };
        }
      }
      throw new Error(`Upstash response failed with status ${res.status}`);
    } catch (err: any) {
      console.warn(`[WARN] Redis rate limiter failed; falling back to in-memory store. Error: ${err.message}`);
    }
  }

  // Resilient fallback to memory Map store
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

