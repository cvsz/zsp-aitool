import { z } from "zod";

const MAX_BASE64_MB = 8;

export const extractOCRSchema = z.object({
  imageBase64: z
    .string()
    .min(1, "imageBase64 is required")
    .refine((v) => (v.length * 3) / 4 <= MAX_BASE64_MB * 1024 * 1024, "Image too large"),
  mimeType: z.string().startsWith("image/", "mimeType must be image/*"),
  source: z.string().max(100).optional(),
});

export const getOCRJobSchema = z.object({
  id: z.string().min(1),
});

export type ExtractOCRInput = z.infer<typeof extractOCRSchema>;
