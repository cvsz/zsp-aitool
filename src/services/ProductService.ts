import { Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { parsePriceSafely, normalizeProductUrl, sanitizeOptionalText } from "@/lib/product-validation";
import { prisma } from "@/lib/prisma";
import { assertSafeImportUrl } from "@/lib/url-safety";
import type { CreateProductInput, UpdateProductInput } from "@/schemas/product.schema";

const productInclude = {
  images: {
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.ProductInclude;

export type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export class ProductService {
  async list(userId: string) { return prisma.product.findMany({ where: { userId, deletedAt: null }, include: productInclude, orderBy: { createdAt: "desc" } }); }
  async getById(userId: string, id: string) { const product = await prisma.product.findFirst({ where: { id, userId, deletedAt: null }, include: productInclude }); if (!product) throw new AppError("NOT_FOUND", "Product not found", 404); return product; }

  private sanitizeCreateInput(input: CreateProductInput): CreateProductInput {
    return {
      ...input,
      price: parsePriceSafely(input.price),
      currency: input.currency?.trim() || "THB",
      shopName: sanitizeOptionalText(input.shopName, 200),
      category: sanitizeOptionalText(input.category, 200),
      originalUrl: normalizeProductUrl(input.originalUrl),
    };
  }

  async create(userId: string, input: CreateProductInput) {
    const sanitized = this.sanitizeCreateInput(input);
    const duplicate = await prisma.product.findFirst({ where: { userId, originalUrl: sanitized.originalUrl, deletedAt: null } });
    if (duplicate) throw new AppError("DUPLICATE_PRODUCT_URL", "Product URL already exists for this user", 409);
    return prisma.product.create({ data: { userId, ...sanitized, price: new Prisma.Decimal(sanitized.price), rating: sanitized.rating == null ? undefined : new Prisma.Decimal(sanitized.rating), rawMetadata: { ...(sanitized.rawMetadata as object | undefined), rawOriginalUrl: input.originalUrl } as Prisma.InputJsonValue | undefined, images: { create: sanitized.images.map((url, sortOrder) => ({ url, sortOrder })) } }, include: productInclude });
  }

  async update(userId: string, id: string, input: UpdateProductInput) {
    await this.getById(userId, id);
    if (input.images) await prisma.productImage.updateMany({ where: { productId: id, deletedAt: null }, data: { deletedAt: new Date() } });
    return prisma.product.update({ where: { id }, data: { ...input, originalUrl: input.originalUrl ? normalizeProductUrl(input.originalUrl) : undefined, price: input.price == null ? undefined : new Prisma.Decimal(parsePriceSafely(input.price)), rating: input.rating == null ? undefined : new Prisma.Decimal(input.rating), shopName: sanitizeOptionalText(input.shopName, 200), category: sanitizeOptionalText(input.category, 200), rawMetadata: input.rawMetadata as Prisma.InputJsonValue | undefined, images: input.images ? { create: input.images.map((url, sortOrder) => ({ url, sortOrder })) } : undefined }, include: productInclude });
  }

  async softDelete(userId: string, id: string) { await this.getById(userId, id); await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } }); }

  async importByUrl(userId: string, originalUrl: string) {
    await assertSafeImportUrl(originalUrl);
    const normalizedUrl = normalizeProductUrl(originalUrl);
    const duplicate = await prisma.product.findFirst({ where: { userId, originalUrl: normalizedUrl, deletedAt: null }, include: productInclude });
    if (duplicate) return { duplicate: true, product: duplicate };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let previewTitle: string | undefined;
    try {
      const response = await fetch(normalizedUrl, { signal: controller.signal, headers: { "user-agent": "zsp-aitool/import-review" } });
      if (response.ok) {
        const body = await response.text();
        if (body.length > 1024 * 1024) throw new AppError("VALIDATION_ERROR", "Response too large", 413);
        previewTitle = body.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
      }
    } finally {
      clearTimeout(timeout);
    }

    return { duplicate: false, draft: { title: previewTitle, originalUrl: normalizedUrl, rawOriginalUrl: originalUrl, note: "User must review imported product data before saving." } };
  }

  async importFromExtension(userId: string, payload: CreateProductInput & { visibleDataOnly: true }) { return this.create(userId, payload); }
  async importJson(userId: string, products: CreateProductInput[]) { return Promise.all(products.map((product) => this.create(userId, product))); }
  async updateAffiliateLink(userId: string, id: string, affiliateUrl: string) { return this.update(userId, id, { affiliateUrl }); }
}

export const productService = new ProductService();
