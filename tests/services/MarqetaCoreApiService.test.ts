import { beforeEach, describe, expect, it, vi } from "vitest";
import { MarqetaCoreApiService } from "@/services/MarqetaCoreApiService";

beforeEach(() => {
  process.env.MARQETA_ENV = "sandbox";
  process.env.MARQETA_BASE_URL = "https://sandbox-api.marqeta.com/v3";
  process.env.MARQETA_APPLICATION_TOKEN = "app_token";
  process.env.MARQETA_ADMIN_ACCESS_TOKEN = "admin_token";
  process.env.MARQETA_TIMEOUT_MS = "1000";
  process.env.MARQETA_MAX_RETRIES = "2";
});

describe("MarqetaCoreApiService", () => {
  it("redacts token-like fields from errors", async () => {
    const svc = new MarqetaCoreApiService(vi.fn(async () => ({ ok: false, status: 422, json: async () => ({ error_message: "authorization: Basic abc token=xyz" }) })) as never);
    await expect(svc.request({ method: "GET", path: "/x" })).rejects.toMatchObject({ message: expect.not.stringContaining("Basic abc") });
  });
  it("requires idempotency key when mutating retry enabled", async () => {
    const svc = new MarqetaCoreApiService(vi.fn() as never);
    await expect(svc.request({ method: "POST", path: "/x", safeToRetry: true, body: { a: 1 } })).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REQUIRED" });
  });
  it("retries 429 only for safe call", async () => {
    let count = 0;
    const fetchImpl = vi.fn(async () => {
      count += 1;
      if (count === 1) return { ok: false, status: 429, json: async () => ({}) };
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    }) as never;
    const svc = new MarqetaCoreApiService(fetchImpl, async () => undefined);
    const result = await svc.request<{ ok: boolean }>({ method: "GET", path: "/x", safeToRetry: true });
    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
