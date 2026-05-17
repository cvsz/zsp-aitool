import { z } from "zod";

export const aiPlatformSchema = z.enum([
  "facebook",
  "instagram",
  "threads",
  "x",
  "blog",
  "seo_article",
  "comment",
  "short_caption",
]);

export const aiToneSchema = z.enum([
  "friendly",
  "professional",
  "casual",
  "energetic",
  "minimal",
]);

export const aiLanguageSchema = z.enum(["th", "en"]);

export const aiContentLengthSchema = z.enum(["short", "medium", "long"]);

export const aiProductInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().min(1).optional(),
  shopName: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  soldCount: z.number().int().nonnegative().optional(),
  category: z.string().optional(),
  keyFeatures: z.array(z.string().min(1)).optional(),
});

export const aiGenerationInputSchema = z.object({
  platform: aiPlatformSchema,
  tone: aiToneSchema,
  language: aiLanguageSchema,
  contentLength: aiContentLengthSchema,
  versions: z.number().int().min(1).max(5).default(1),
  affiliateDisclosure: z.string().optional(),
  product: aiProductInputSchema,
});

export const aiOutputSchema = z.object({
  platform: aiPlatformSchema,
  headline: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  cta: z.string(),
  affiliateDisclosure: z.string(),
  warnings: z.array(z.string()),
});

export type AIPlatform = z.infer<typeof aiPlatformSchema>;
export type AITone = z.infer<typeof aiToneSchema>;
export type AILanguage = z.infer<typeof aiLanguageSchema>;
export type AIContentLength = z.infer<typeof aiContentLengthSchema>;
export type AIProductInput = z.infer<typeof aiProductInputSchema>;
export type AIGenerationInput = z.infer<typeof aiGenerationInputSchema>;
export type AIOutput = z.infer<typeof aiOutputSchema>;
