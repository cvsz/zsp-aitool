import { describe, expect, it } from "vitest";

import { validateAndNormalizeTags, validateImportFields, normalizeProductUrl } from "@/lib/product-validation";
import { AppError } from "@/lib/errors";
import { createProductSchema } from "@/schemas/product.schema";

describe("product validation", () => {
  it("normalizes URL for duplicate comparison", () => {
    const normalized = normalizeProductUrl("https://Example.com/p/1/?utm_source=x&b=2&a=1#fragment");
    expect(normalized).toBe("https://example.com/p/1?a=1&b=2");
  });

  it("rejects invalid original URL", () => {
    const result = createProductSchema.safeParse({ title: "A", price: 100, originalUrl: "notaurl", images: [] });
    expect(result.success).toBe(false);
  });

  it("rejects non-http image URL", () => {
    const result = createProductSchema.safeParse({ title: "A", price: 100, originalUrl: "https://example.com", images: ["ftp://example.com/a.jpg"] });
    expect(result.success).toBe(false);
  });

  it("validates required import fields", () => {
    expect(() => validateImportFields({ title: "", originalUrl: "https://example.com", price: 10, imageUrls: [] })).toThrow(AppError);
    expect(() => validateImportFields({ title: "A", originalUrl: "https://example.com", price: -1, imageUrls: [] })).toThrow(AppError);
    expect(() => validateImportFields({ title: "A", originalUrl: "https://example.com", price: 10, imageUrls: [], rating: 6 })).toThrow(AppError);
    expect(() => validateImportFields({ title: "A", originalUrl: "https://example.com", price: 10, imageUrls: [], reviewCount: -1 })).toThrow(AppError);
  });

  it("normalizes and de-duplicates tags", () => {
    expect(validateAndNormalizeTags(["  ดีล ", "ดีล", "โปร"])).toEqual(["ดีล", "โปร"]);
  });
});
