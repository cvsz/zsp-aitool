import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fetchAndCacheHyperframesAsset } from "@/lib/hyperframes/asset-fetch";

function fakeResponse(contentType: string, body: Uint8Array, ok = true): Response {
  return new Response(body, { status: ok ? 200 : 500, headers: { "content-type": contentType } });
}

describe("hyperframes asset ingestion hardening", () => {
  it("localhost blocked", async () => {
    await expect(fetchAndCacheHyperframesAsset("http://localhost/a.png", "/tmp/x", 1024, { lookupHost: async () => ["127.0.0.1"] })).rejects.toThrow("asset host blocked");
  });

  it("private IP blocked", async () => {
    await expect(fetchAndCacheHyperframesAsset("https://example.com/a.png", "/tmp/x", 1024, { lookupHost: async () => ["192.168.1.5"] })).rejects.toThrow("asset host blocked");
  });

  it("metadata IP blocked", async () => {
    await expect(fetchAndCacheHyperframesAsset("https://example.com/a.png", "/tmp/x", 1024, { lookupHost: async () => ["169.254.169.254"] })).rejects.toThrow("asset host blocked");
  });

  it("data/javascript blocked", async () => {
    await expect(fetchAndCacheHyperframesAsset("data:text/plain,a", "/tmp/x", 1024)).rejects.toThrow("unsupported asset protocol");
    await expect(fetchAndCacheHyperframesAsset("javascript:alert(1)", "/tmp/x", 1024)).rejects.toThrow("unsupported asset protocol");
  });

  it("oversized asset blocked", async () => {
    const bytes = new Uint8Array(2048);
    await expect(fetchAndCacheHyperframesAsset("https://cdn.example.com/a.png", "/tmp/x", 1024, {
      lookupHost: async () => ["93.184.216.34"],
      fetchImpl: async () => fakeResponse("image/png", bytes),
    })).rejects.toThrow("asset too large");
  });

  it("MIME mismatch blocked", async () => {
    await expect(fetchAndCacheHyperframesAsset("https://cdn.example.com/a.png", "/tmp/x", 1024, {
      lookupHost: async () => ["93.184.216.34"],
      fetchImpl: async () => fakeResponse("video/mp4", new Uint8Array([1, 2])),
    })).rejects.toThrow("asset extension mismatch");
  });

  it("safe asset cached", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "hf-asset-"));
    try {
      const output = await fetchAndCacheHyperframesAsset("https://cdn.example.com/a.png", dir, 4096, {
        lookupHost: async () => ["93.184.216.34"],
        fetchImpl: async () => fakeResponse("image/png", new Uint8Array([1, 2, 3])),
      });
      expect(output.startsWith(dir)).toBe(true);
      expect(output.endsWith(".png")).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
