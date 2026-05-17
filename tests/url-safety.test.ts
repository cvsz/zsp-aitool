import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => ({
  default: {
    lookup: vi.fn(),
  },
}));

import dns from "node:dns/promises";
import { AppError } from "@/lib/errors";
import { assertSafeImportUrl, fetchWithSafety } from "@/lib/url-safety";

const mockedLookup = vi.mocked(dns.lookup);

describe("assertSafeImportUrl", () => {
  beforeEach(() => {
    mockedLookup.mockReset();
    mockedLookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
  });

  it("accepts valid public URL", async () => {
    await expect(assertSafeImportUrl("https://example.com/product/1")).resolves.toBeUndefined();
  });

  it("rejects invalid protocols", async () => {
    await expect(assertSafeImportUrl("file:///etc/passwd")).rejects.toBeInstanceOf(AppError);
  });

  it("rejects localhost URL", async () => {
    await expect(assertSafeImportUrl("http://localhost:3000/test")).rejects.toThrow("Private or local network URLs are not allowed");
  });

  it("rejects private IP URL", async () => {
    await expect(assertSafeImportUrl("http://192.168.1.2/test")).rejects.toThrow("Private or local network URLs are not allowed");
  });

  it("rejects metadata IP", async () => {
    await expect(assertSafeImportUrl("http://169.254.169.254/latest/meta-data")).rejects.toThrow("Private or local network URLs are not allowed");
  });

  it("rejects .local and .internal domains", async () => {
    await expect(assertSafeImportUrl("https://service.local/item")).rejects.toThrow("Private or local network URLs are not allowed");
    await expect(assertSafeImportUrl("https://api.internal/item")).rejects.toThrow("Private or local network URLs are not allowed");
  });
});

describe("fetchWithSafety", () => {
  beforeEach(() => {
    mockedLookup.mockReset();
    mockedLookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    vi.restoreAllMocks();
  });

  it("rejects redirect to private IP", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private" } }));
    await expect(fetchWithSafety("https://example.com")).rejects.toThrow("Private or local network URLs are not allowed");
  });

  it("rejects oversized responses", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response("a".repeat(1024 * 1024 + 10), { status: 200, headers: { "content-type": "text/html" } }));
    await expect(fetchWithSafety("https://example.com")).rejects.toThrow("Response too large");
  });

  it("accepts valid mocked public URL", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response("<title>OK</title>", { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }));
    await expect(fetchWithSafety("https://example.com/p/1")).resolves.toContain("OK");
  });
});
