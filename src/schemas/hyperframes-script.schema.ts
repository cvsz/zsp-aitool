import { z } from "zod";

import { HYPERFRAME_MAX_DURATION_SECONDS, HYPERFRAME_MIN_DURATION_SECONDS, hyperFrameAspectRatios } from "@/lib/hyperframes/types";

export const hyperframesScriptPlatformOptions = ["tiktok", "reels", "shorts", "facebook", "generic"] as const;
export const hyperframesScriptLanguageOptions = ["th", "en", "mixed"] as const;
export const hyperframesScriptBeatTypes = ["hook", "problem", "productDemo", "benefits", "CTA", "disclosure"] as const;

export const hyperframesScriptRequestSchema = z.object({
  productId: z.string().min(1),
  platform: z.enum(hyperframesScriptPlatformOptions),
  tone: z.string().trim().min(1).max(80),
  language: z.enum(hyperframesScriptLanguageOptions),
  durationSeconds: z.number().int().min(HYPERFRAME_MIN_DURATION_SECONDS).max(HYPERFRAME_MAX_DURATION_SECONDS),
  aspectRatio: z.enum(hyperFrameAspectRatios),
});

export type HyperframesScriptRequest = z.infer<typeof hyperframesScriptRequestSchema>;
