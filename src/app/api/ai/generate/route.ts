import { NextResponse } from "next/server";
import { z } from "zod";
import { MockAIProvider } from "@/services/ai/MockAIProvider";
import { AIContentService } from "@/services/AIContentService";
import { productService } from "@/services/ProductService";
import { withAuth } from "@/middleware/auth-middleware";
import { AppError } from "@/lib/errors";

const bodySchema = z.object({
  productId: z.string().min(1),
  platform: z.enum(["facebook", "instagram", "threads", "x", "blog", "seo_article", "comment", "short_caption"]),
  tone: z.enum(["friendly", "professional", "casual", "energetic", "minimal"]),
  language: z.enum(["th", "en"]),
  versions: z.number().int().min(1).max(5).default(1),
});

export const POST = withAuth(async (request) => {
  try {
    const payload = bodySchema.parse(await request.json());
    const product = await productService.getById(request.auth.userId, payload.productId);
    const service = new AIContentService(new MockAIProvider());
    const outputs = await service.generate({
      ...payload,
      contentLength: "medium",
      product: {
        title: product.title,
        description: product.description ?? undefined,
        price: Number(product.price),
        currency: product.currency,
        shopName: product.shopName ?? undefined,
        rating: product.rating == null ? undefined : Number(product.rating),
        soldCount: product.soldCount ?? undefined,
        category: product.category ?? undefined,
      },
    });
    return NextResponse.json({ ok: true, data: outputs });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate content" } }, { status: 500 });
  }
});
