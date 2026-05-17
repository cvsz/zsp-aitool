import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";
import { assertSafeImportUrl } from "@/lib/url-safety";

describe("assertSafeImportUrl", () => {
  it("accepts public https URLs", () => {
    expect(() => assertSafeImportUrl("https://shopee.co.th/product/123")).not.toThrow();
  });

  it("rejects non-http protocols", () => {
    expect(() => assertSafeImportUrl("file:///etc/passwd")).toThrow(AppError);
  });

  it("rejects localhost/private hosts", () => {
    expect(() => assertSafeImportUrl("http://localhost:3000/internal")).toThrow("Private or local network URLs are not allowed");
    expect(() => assertSafeImportUrl("http://127.0.0.1/internal")).toThrow("Private or local network URLs are not allowed");
    expect(() => assertSafeImportUrl("http://192.168.1.20/internal")).toThrow("Private or local network URLs are not allowed");
  });
});
