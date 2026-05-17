import { z } from "zod";

export const platformSchema = z.enum([
  "facebook",
  "instagram",
  "threads",
  "x",
  "blog",
  "seo_article",
  "comment",
  "short_caption",
]);

export const productInputSchema = z.object({
  title: z.string().min(1).max(255),
  price: z.number().nonnegative(),
  currency: z.string().min(3).max(5),
  originalUrl: z.string().url(),
  affiliateUrl: z.string().url().optional(),
  description: z.string().max(5000).optional(),
});

export const contentGenerationSchema = z.object({
  productId: z.string().min(1),
  platform: platformSchema,
  tone: z.enum(["casual", "friendly", "professional", "excited"]),
  language: z.enum(["th", "en"]),
  prompt: z.string().min(1),
});
