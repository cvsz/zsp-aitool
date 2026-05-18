import { z } from "zod";

export const socialExportProviders = ["tiktok", "reels", "shorts"] as const;

export const hyperframesSocialExportIntentSchema = z.object({
  renderJobId: z.string().min(1),
  provider: z.enum(socialExportProviders),
  confirm: z.literal(true),
  notes: z.string().max(500).optional(),
});

export type HyperframesSocialExportIntentInput = z.infer<typeof hyperframesSocialExportIntentSchema>;
