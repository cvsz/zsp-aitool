import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyRateLimit } from "@/lib/rate-limit";

describe("rate-limit distributed", () => {
  const originalEnv = { ...process.env };
  let fetchMock: any;
  let warnSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("when Upstash credentials are configured", () => {
    beforeEach(() => {
      process.env.UPSTASH_REDIS_REST_URL = "https://mock-upstash.com";
      process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";
    });

    it("should successfully query Upstash pipeline and allow the request", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { result: 2 }, // INCR count
          { result: 15 }, // TTL remaining
        ],
      });

      const result = await applyRateLimit("test-key-success", 5, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
      expect(result.retryAfterSeconds).toBe(15);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://mock-upstash.com/pipeline",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify([
            ["INCR", "test-key-success"],
            ["TTL", "test-key-success"],
          ]),
        })
      );
    });

    it("should set key expiration if it is newly created (ttl === -1)", async () => {
      // First fetch is pipeline (INCR, TTL)
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { result: 1 }, // INCR count
          { result: -1 }, // TTL is -1 (new key)
        ],
      });

      // Second fetch is expire
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 1 }),
      });

      const result = await applyRateLimit("test-key-new", 5, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "https://mock-upstash.com/expire/test-key-new/60",
        expect.objectContaining({
          method: "GET",
          headers: { Authorization: "Bearer mock-token" },
        })
      );
    });

    it("should gracefully degrade to in-memory fallback on fetch reject (network failure)", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network connection lost"));

      const result = await applyRateLimit("test-key-fallback-fail", 2, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WARN] Redis rate limiter failed; falling back to in-memory store")
      );
    });

    it("should gracefully degrade to in-memory fallback on status error (res.ok is false)", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 502,
      });

      const result = await applyRateLimit("test-key-fallback-status", 2, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WARN] Redis rate limiter failed; falling back to in-memory store")
      );
    });
  });

  describe("when Upstash credentials are NOT configured", () => {
    beforeEach(() => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    it("should immediately fall back to local Map store and enforce limit", async () => {
      const result1 = await applyRateLimit("test-key-local", 2, 60000);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(1);

      const result2 = await applyRateLimit("test-key-local", 2, 60000);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(0);

      const result3 = await applyRateLimit("test-key-local", 2, 60000);
      expect(result3.allowed).toBe(false);
      expect(result3.remaining).toBe(0);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
