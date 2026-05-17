import { z } from "zod";

const nonNegativeNumber = z.number().finite().min(0);
const httpUrlSchema = z.string().trim().url().max(2000).refine((value) => value.startsWith("http://") || value.startsWith("https://"), "URL must use HTTP/HTTPS");
const cleanText = (max: number) => z.string().trim().max(max).transform((v) => v.replace(/\s+/g, " ")).optional();

export const productImageSchema = httpUrlSchema;

export const productBaseSchema = z.object({
  title: z.string().trim().min(1).max(300),
  price: nonNegativeNumber,
  currency: z.string().trim().min(1).max(10).default("THB"),
  originalUrl: httpUrlSchema,
  affiliateUrl: httpUrlSchema.optional(),
  shopName: cleanText(200),
  rating: z.number().min(0).max(5).optional(),
  soldCount: z.number().int().min(0).optional(),
  reviewCount: z.number().int().min(0).optional(),
  description: z.string().trim().max(10000).optional(),
  category: cleanText(200),
  images: z.array(productImageSchema).max(30).default([]),
  rawMetadata: z.record(z.unknown()).optional(),
});

export const createProductSchema = productBaseSchema;
export const updateProductSchema = productBaseSchema.partial().refine((v) => Object.keys(v).length > 0, "At least one field is required");
export const importUrlSchema = z.object({ originalUrl: httpUrlSchema });
export const importJsonSchema = z.object({ products: z.array(createProductSchema).min(1).max(100) });
export const extensionImportSchema = z.object({
  payload: z.object({
    title: z.string().trim().min(1).max(300),
    originalUrl: httpUrlSchema,
    price: nonNegativeNumber.optional(),
    currency: z.string().trim().min(1).max(10).optional(),
    description: z.string().trim().max(10000).optional(),
    images: z.array(productImageSchema).max(30).optional(),
    rating: z.number().min(0).max(5).optional(),
    soldCount: z.number().int().min(0).optional(),
    reviewCount: z.number().int().min(0).optional(),
    visibleDataOnly: z.literal(true),
  }),
});
export const affiliateLinkSchema = z.object({ affiliateUrl: httpUrlSchema });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
