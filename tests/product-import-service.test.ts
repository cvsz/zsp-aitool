import { describe, expect, it } from "vitest";
import { ProductImportService } from "../src/services/product-import-service";

describe("ProductImportService", () => {
  it("creates a product", () => {
    const service = new ProductImportService();
    const product = service.import({
      title: "Demo Product",
      price: 10,
      currency: "USD",
      originalUrl: "https://example.com/p/1",
    });

    expect(product.slug).toBe("demo-product");
    expect(product.importStatus).toBe("completed");
    expect(service.list()).toHaveLength(1);
  });

  it("marks duplicate URL imports for review", () => {
    const service = new ProductImportService();
    service.import({
      title: "Old",
      price: 10,
      currency: "USD",
      originalUrl: "https://example.com/p/1",
    });

    const updated = service.import({
      title: "New",
      price: 15,
      currency: "USD",
      originalUrl: "https://example.com/p/1",
    });

    expect(updated.title).toBe("New");
    expect(updated.importStatus).toBe("needs_review");
    expect(service.list()).toHaveLength(1);
  });
});
