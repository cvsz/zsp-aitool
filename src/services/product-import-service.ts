import { slugify } from "../lib/slug";
import type { Product, ProductInput } from "../types/product";

export class ProductImportService {
  private readonly products = new Map<string, Product>();

  import(input: ProductInput): Product {
    const existing = this.findByOriginalUrl(input.originalUrl);
    const now = new Date().toISOString();

    if (existing) {
      const merged: Product = {
        ...existing,
        ...input,
        slug: slugify(input.title),
        importStatus: "needs_review",
        updatedAt: now,
      };
      this.products.set(existing.id, merged);
      return merged;
    }

    const id = crypto.randomUUID();
    const created: Product = {
      ...input,
      id,
      slug: slugify(input.title),
      importStatus: "completed",
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, created);
    return created;
  }

  findByOriginalUrl(originalUrl: string): Product | undefined {
    return Array.from(this.products.values()).find((p) => p.originalUrl === originalUrl);
  }

  list(): Product[] {
    return Array.from(this.products.values());
  }
}
