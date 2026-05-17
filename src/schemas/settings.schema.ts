import { z } from "zod";

export const aiProviderSchema = z.enum(["openai", "openrouter", "anthropic", "google", "other"]);
export const ocrProviderSchema = z.enum(["google_vision", "tesseract", "ocr_space", "other"]);
export const toneSchema = z.enum(["friendly", "professional", "casual", "sales", "minimal"]);
export const languageSchema = z.enum(["th", "en", "mixed"]);
export const ctaStyleSchema = z.enum(["soft", "direct", "urgent", "educational"]);
export const hashtagPreferenceSchema = z.enum(["light", "balanced", "heavy", "none"]);

export const profileSchema = z.object({
  displayName: z.string().min(1).max(100),
  niche: z.string().max(120).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

export const settingsInputSchema = z.object({
  aiProvider: aiProviderSchema,
  defaultLanguage: languageSchema,
  defaultTone: toneSchema,
  affiliateDisclosure: z.string().min(1).max(500),
  defaultHashtagPreference: hashtagPreferenceSchema,
  defaultCtaStyle: ctaStyleSchema,
  ocrProvider: ocrProviderSchema,
  profile: profileSchema,
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
