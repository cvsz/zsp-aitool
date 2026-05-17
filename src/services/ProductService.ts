import { Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors";
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
  async list(userId: string) {
    return prisma.product.findMany({ where: { userId, deletedAt: null }, include: productInclude, orderBy: { createdAt: "desc" } });
  }

  async getById(userId: string, id: string) {
    const product = await prisma.product.findFirst({ where: { id, userId, deletedAt: null }, include: productInclude });
    if (!product) throw new AppError("NOT_FOUND", "Product not found", 404);
    return product;
  }

  async create(userId: string, input: CreateProductInput) {
    return prisma.product.create({
      data: {
        userId,
        ...input,
        price: new Prisma.Decimal(input.price),
        rating: input.rating == null ? undefined : new Prisma.Decimal(input.rating),
        rawMetadata: input.rawMetadata as Prisma.InputJsonValue | undefined,
        images: { create: input.images.map((url, sortOrder) => ({ url, sortOrder })) },
      }, include: productInclude,
    });
  }

  async update(userId: string, id: string, input: UpdateProductInput) {
    await this.getById(userId, id);
    if (input.images) {
      await prisma.productImage.updateMany({ where: { productId: id, deletedAt: null }, data: { deletedAt: new Date() } });
    }
    return prisma.product.update({
      where: { id },
      data: {
        ...input,
        price: input.price == null ? undefined : new Prisma.Decimal(input.price),
        rating: input.rating == null ? undefined : new Prisma.Decimal(input.rating),
        rawMetadata: input.rawMetadata as Prisma.InputJsonValue | undefined,
        images: input.images ? { create: input.images.map((url, sortOrder) => ({ url, sortOrder })) } : undefined,
      }, include: productInclude,
    });
  }

  async softDelete(userId: string, id: string) {
    await this.getById(userId, id);
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async importByUrl(userId: string, originalUrl: string) {
    assertSafeImportUrl(originalUrl);

    const duplicate = await prisma.product.findFirst({ where: { userId, originalUrl, deletedAt: null }, include: productInclude });
    if (duplicate) return { duplicate: true, product: duplicate };
    return { duplicate: false, draft: { originalUrl, note: "Please confirm or fill product details manually." } };
  }

  async importFromExtension(userId: string, payload: CreateProductInput & { visibleDataOnly: true }) {
    return this.create(userId, payload);
  }

  async importJson(userId: string, products: CreateProductInput[]) {
    return Promise.all(products.map((product) => this.create(userId, product)));
  }

  async updateAffiliateLink(userId: string, id: string, affiliateUrl: string) {
    return this.update(userId, id, { affiliateUrl });
  }
}

export const productService = new ProductService();
