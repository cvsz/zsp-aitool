import { NextResponse } from "next/server";
import { z } from "zod";

import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { HYPERFRAME_MAX_DURATION_SECONDS, HYPERFRAME_MAX_TEXT_LENGTH, HYPERFRAME_MIN_DURATION_SECONDS, hyperFrameAspectRatios, hyperFramePlatforms } from "@/lib/hyperframes/types";
import { withAuth } from "@/middleware/auth-middleware";
import { AppError } from "@/lib/errors";
import { productService } from "@/services/ProductService";
import { hyperframesVoiceoverSchema, isTtsEnabled } from "@/lib/hyperframes/voiceover";
import { getHyperframesBrandKit } from "@/services/hyperframes-brand-kit-service";

const bodySchema = z
  .object({
    productId: z.string().min(1),
    platform: z.enum(hyperFramePlatforms),
    aspectRatio: z.enum(hyperFrameAspectRatios),
    durationSeconds: z.number().int().min(HYPERFRAME_MIN_DURATION_SECONDS).max(HYPERFRAME_MAX_DURATION_SECONDS),
    caption: z.string().max(HYPERFRAME_MAX_TEXT_LENGTH).optional(),
    script: z.string().max(HYPERFRAME_MAX_TEXT_LENGTH).optional(),
    voiceover: hyperframesVoiceoverSchema.optional(),
  })
  .refine((data) => Boolean(data.caption?.trim() || data.script?.trim()), {
    message: "caption_or_script_required",
    path: ["caption"],
  });

export const POST = withAuth(async (request) => {
  try {
    const payload = bodySchema.parse(await request.json());
    if (!isTtsEnabled() && payload.voiceover?.source === "upload") {
      return NextResponse.json({ ok: false, error: { code: "TTS_DISABLED", message: "voiceover provider disabled" } }, { status: 403 });
    }
    const product = await productService.getById(request.auth.userId, payload.productId);

    const brandKit = await getHyperframesBrandKit(request.auth.userId);
    const composition = buildHyperFrameComposition({
      ...payload,
      durationSeconds: payload.durationSeconds,
      product: {
        title: product.title,
        price: product.price == null ? null : String(product.price),
        currency: product.currency,
        imageUrl: product.images[0]?.url,
        affiliateUrl: product.affiliateUrl,
      },
      brandKit,
    });

    return NextResponse.json({ ok: true, data: composition });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    }

    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json(
      { ok: false, error: { code: "COMPOSE_FAILED", message: "ไม่สามารถสร้าง HyperFrames composition ได้" } },
      { status },
    );
  }
});
