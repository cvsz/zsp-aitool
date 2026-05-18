import { z } from "zod";

import { hyperFrameAspectRatios } from "@/lib/hyperframes/types";

const cssHexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "invalid_color");

export const hyperframesBrandKitSchema = z.object({
  brandColors: z.array(cssHexColorSchema).max(8).default([]),
  fontPreference: z.string().trim().max(120).optional().nullable(),
  logoUrl: z.string().trim().max(1024).optional().nullable(),
  watermarkText: z.string().trim().max(120).optional().nullable(),
  defaultAspectRatio: z.enum(hyperFrameAspectRatios).optional().nullable(),
  defaultCTA: z.string().trim().max(120).optional().nullable(),
});

export type HyperframesBrandKitInput = z.infer<typeof hyperframesBrandKitSchema>;
