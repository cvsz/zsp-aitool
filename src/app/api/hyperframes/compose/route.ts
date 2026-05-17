import { NextResponse } from "next/server";
import { z } from "zod";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { hyperFrameAspectRatios, hyperFramePlatforms } from "@/lib/hyperframes/types";
import { withAuth } from "@/middleware/auth-middleware";
import { AppError } from "@/lib/errors";
import { productService } from "@/services/ProductService";

const bodySchema = z.object({
  productId: z.string().min(1),
  platform: z.enum(hyperFramePlatforms),
  aspectRatio: z.enum(hyperFrameAspectRatios),
  durationSeconds: z.number().int().min(1).max(120),
  caption: z.string().min(1).max(1000),
});

export const POST = withAuth(async (request) => {
  try {
    const payload = bodySchema.parse(await request.json());
    const product = await productService.getById(request.auth.userId, payload.productId);
    const composition = buildHyperFrameComposition({ ...payload, product: { title: product.title, price: String(product.price), currency: product.currency, imageUrl: product.images[0]?.url, affiliateUrl: product.affiliateUrl } });
    return NextResponse.json({ ok: true, data: composition });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ ok: false, error: { code: "COMPOSE_FAILED", message: "ไม่สามารถสร้าง HyperFrames composition ได้" } }, { status });
  }
});
