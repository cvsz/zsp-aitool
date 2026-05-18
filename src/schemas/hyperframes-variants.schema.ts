import { z } from "zod";

import { HYPERFRAME_MAX_DURATION_SECONDS, HYPERFRAME_MIN_DURATION_SECONDS } from "@/lib/hyperframes/types";

export const hyperframesVariantPlatforms = ["tiktok", "reels", "shorts", "facebook", "generic"] as const;
export type HyperframesVariantPlatform = (typeof hyperframesVariantPlatforms)[number];

const beatSchema = z.object({ atSecond: z.number().int().min(0), text: z.string().min(1).max(240) });

export const hyperframesVariantsRequestSchema = z.object({
  productId: z.string().min(1),
  baseScriptId: z.string().min(1).optional(),
  beats: z.array(beatSchema).min(1).max(24).optional(),
  targetPlatforms: z.array(z.enum(hyperframesVariantPlatforms)).min(1).max(5),
}).superRefine((value, ctx) => {
  if (!value.baseScriptId && !value.beats) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "baseScriptId or beats is required" });
  }
});

export const hyperframesVariantOutputSchema = z.object({
  platform: z.enum(hyperframesVariantPlatforms),
  aspectRatio: z.enum(["9:16", "1:1", "16:9"]),
  durationSeconds: z.number().int().min(HYPERFRAME_MIN_DURATION_SECONDS).max(HYPERFRAME_MAX_DURATION_SECONDS),
  cta: z.string().min(1).max(200),
  captions: z.array(z.object({ start: z.number().int().min(0), end: z.number().int().min(0), text: z.string().min(1).max(240) })).min(1),
  disclosure: z.string().nullable(),
  renderTriggered: z.literal(false),
});

export type HyperframesVariantsRequest = z.infer<typeof hyperframesVariantsRequestSchema>;
export type HyperframesVariantOutput = z.infer<typeof hyperframesVariantOutputSchema>;
