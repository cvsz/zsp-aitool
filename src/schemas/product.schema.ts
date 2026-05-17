import { z } from "zod";

const nonNegativeNumber = z.number().finite().min(0);

export const productImageSchema = z.string().trim().url().max(2000);

export const productBaseSchema = z.object({
  title: z.string().trim().min(1).max(300),
  price: nonNegativeNumber,
  currency: z.string().trim().min(1).max(10).default("THB"),
  originalUrl: z.string().trim().url().max(2000),
  affiliateUrl: z.string().trim().url().max(2000).optional(),
  shopName: z.string().trim().max(200).optional(),
  rating: z.number().min(0).max(5).optional(),
  soldCount: z.number().int().min(0).optional(),
  description: z.string().trim().max(10000).optional(),
  category: z.string().trim().max(200).optional(),
  images: z.array(productImageSchema).max(30).default([]),
  rawMetadata: z.record(z.unknown()).optional(),
});

export const createProductSchema = productBaseSchema;
export const updateProductSchema = productBaseSchema.partial().refine((v) => Object.keys(v).length > 0, "At least one field is required");
export const importUrlSchema = z.object({ originalUrl: z.string().trim().url().max(2000) });
export const importJsonSchema = z.object({ products: z.array(createProductSchema).min(1).max(100) });
export const extensionImportSchema = z.object({
  payload: z.object({
    title: z.string().trim().min(1).max(300),
    originalUrl: z.string().trim().url().max(2000),
    price: nonNegativeNumber.optional(),
    currency: z.string().trim().min(1).max(10).optional(),
    shopName: z.string().trim().max(200).optional(),
    description: z.string().trim().max(10000).optional(),
    images: z.array(productImageSchema).max(30).optional(),
    visibleDataOnly: z.literal(true),
  }),
});
export const affiliateLinkSchema = z.object({ affiliateUrl: z.string().trim().url().max(2000) });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
