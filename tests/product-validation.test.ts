import { describe, expect, it } from "vitest";

import { normalizeProductUrl } from "@/lib/product-validation";
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
});
