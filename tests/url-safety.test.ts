import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => ({
  default: {
    lookup: vi.fn(),
  },
}));

import dns from "node:dns/promises";
import { AppError } from "@/lib/errors";
import { assertSafeImportUrl } from "@/lib/url-safety";

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
});
