import { Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { parsePriceSafely, normalizeProductUrl, sanitizeOptionalText, ensureHttpUrl, validateAndNormalizeTags, validateImportFields } from "@/lib/product-validation";
import { prisma } from "@/lib/prisma";
import { fetchWithSafety } from "@/lib/url-safety";
import type { CreateProductInput, UpdateProductInput } from "@/schemas/product.schema";

const productInclude = {
  images: {
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.ProductInclude;

export type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export type ProductListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  shopName?: string;
  source?: string;
  hasAffiliateUrl?: boolean;
  sortBy?: "createdAt" | "title" | "price";
  sortDir?: "asc" | "desc";
};

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export class ProductService {
  async list(userId: string) { return prisma.product.findMany({ where: { userId, deletedAt: null }, include: productInclude, orderBy: { createdAt: "desc" }, take: MAX_PAGE_SIZE }); }
  async getById(userId: string, id: string) { const product = await prisma.product.findFirst({ where: { id, userId, deletedAt: null }, include: productInclude }); if (!product) throw new AppError("NOT_FOUND", "Product not found", 404); return product; }

  async listProductsPaginated(userId: string, filters: ProductListFilters) {
    const page = Math.max(1, Math.floor(filters.page ?? 1));
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(filters.pageSize ?? DEFAULT_PAGE_SIZE)));
    const normalizedQ = filters.q?.trim();

    const where: Prisma.ProductWhereInput = {
      userId,
      deletedAt: null,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.shopName ? { shopName: filters.shopName } : {}),
      ...(filters.source ? { rawMetadata: { path: ["source"], equals: filters.source } } : {}),
      ...(typeof filters.hasAffiliateUrl === "boolean" ? (filters.hasAffiliateUrl ? { affiliateUrl: { not: null } } : { OR: [{ affiliateUrl: null }, { affiliateUrl: "" }] }) : {}),
      ...(normalizedQ
        ? {
          OR: [
            { title: { contains: normalizedQ, mode: "insensitive" } },
            { shopName: { contains: normalizedQ, mode: "insensitive" } },
            { category: { contains: normalizedQ, mode: "insensitive" } },
            { originalUrl: { contains: normalizedQ, mode: "insensitive" } },
          ],
        }
        : {}),
    };

    const sortBy = filters.sortBy ?? "createdAt";
    const sortDir = filters.sortDir ?? "desc";
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ [sortBy]: sortDir }, { id: "desc" }];

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({ where, include: productInclude, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return {
      items,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
      filters: {
        q: normalizedQ ?? "",
        category: filters.category ?? "",
        shopName: filters.shopName ?? "",
        source: filters.source ?? "",
        hasAffiliateUrl: filters.hasAffiliateUrl ?? null,
        sortBy,
        sortDir,
      },
    };
  }

  private sanitizeCreateInput(input: CreateProductInput): CreateProductInput {
    validateImportFields({
      title: input.title,
      originalUrl: input.originalUrl,
      price: input.price,
      imageUrls: input.images,
      rating: input.rating,
      reviewCount: input.reviewCount,
      soldCount: input.soldCount,
      tags: (input.rawMetadata as Record<string, unknown> | undefined)?.tags,
    });

    return {
      ...input,
      price: parsePriceSafely(input.price),
      currency: input.currency?.trim() || "THB",
      shopName: sanitizeOptionalText(input.shopName, 200),
      category: sanitizeOptionalText(input.category, 200),
      originalUrl: normalizeProductUrl(input.originalUrl.trim()),
      images: input.images.map((imageUrl) => ensureHttpUrl(imageUrl, "imageUrls")),
      rating: input.rating,
      soldCount: input.soldCount,
      reviewCount: input.reviewCount,
    };
  }
  // rest unchanged
  async create(userId: string, input: CreateProductInput) { const sanitized = this.sanitizeCreateInput(input); const duplicate = await prisma.product.findFirst({ where: { userId, originalUrl: sanitized.originalUrl, deletedAt: null } }); if (duplicate) throw new AppError("DUPLICATE_PRODUCT_URL", "Product URL already exists for this user", 409); const rawMetadataInput = (sanitized.rawMetadata as Record<string, unknown> | undefined) ?? {}; const normalizedTags = validateAndNormalizeTags(rawMetadataInput.tags); const { images, reviewCount, ...productInput } = sanitized; return prisma.product.create({ data: { userId, ...productInput, price: new Prisma.Decimal(sanitized.price), rating: sanitized.rating == null ? undefined : new Prisma.Decimal(sanitized.rating), rawMetadata: { ...rawMetadataInput, rawOriginalUrl: input.originalUrl, reviewCount, tags: normalizedTags } as Prisma.InputJsonValue | undefined, images: { create: images.map((url, sortOrder) => ({ url, sortOrder })) } }, include: productInclude }); }
  async update(userId: string, id: string, input: UpdateProductInput) { await this.getById(userId, id); if (input.images) await prisma.productImage.updateMany({ where: { productId: id, deletedAt: null }, data: { deletedAt: new Date() } }); return prisma.product.update({ where: { id }, data: { ...input, originalUrl: input.originalUrl ? normalizeProductUrl(input.originalUrl) : undefined, price: input.price == null ? undefined : new Prisma.Decimal(parsePriceSafely(input.price)), rating: input.rating == null ? undefined : new Prisma.Decimal(input.rating), shopName: sanitizeOptionalText(input.shopName, 200), category: sanitizeOptionalText(input.category, 200), rawMetadata: input.rawMetadata as Prisma.InputJsonValue | undefined, images: input.images ? { create: input.images.map((url, sortOrder) => ({ url, sortOrder })) } : undefined }, include: productInclude }); }
  async softDelete(userId: string, id: string) { await this.getById(userId, id); await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } }); }
  async importByUrl(userId: string, originalUrl: string) { const normalizedUrl = normalizeProductUrl(originalUrl); const duplicate = await prisma.product.findFirst({ where: { userId, originalUrl: normalizedUrl, deletedAt: null }, include: productInclude }); if (duplicate) throw new AppError("DUPLICATE_PRODUCT_URL", "Product URL already exists for this user", 409); let previewTitle: string | undefined; try { const body = await fetchWithSafety(normalizedUrl); previewTitle = body.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim(); } catch (error) { if (error instanceof AppError) throw error; throw new AppError("VALIDATION_ERROR", "Unable to import URL", 400); } return { duplicate: false, draft: { title: previewTitle, originalUrl: normalizedUrl, rawOriginalUrl: originalUrl, note: "User must review imported product data before saving." } }; }
  async importFromExtension(userId: string, payload: CreateProductInput & { visibleDataOnly: true }) { return this.create(userId, payload); }
  async importJson(userId: string, products: CreateProductInput[]) { return Promise.all(products.map((product) => this.create(userId, product))); }
  async updateAffiliateLink(userId: string, id: string, affiliateUrl: string) { return this.update(userId, id, { affiliateUrl }); }
}

export const productService = new ProductService();
