import { NextResponse } from "next/server";
import { z } from "zod";
import { MockAIProvider } from "@/services/ai/MockAIProvider";
import { AIContentService } from "@/services/AIContentService";
import { productService } from "@/services/ProductService";
import { withAuth } from "@/middleware/auth-middleware";
import { AppError } from "@/lib/errors";
import { PromptBuilder } from "@/services/ai/PromptBuilder";

const bodySchema = z.object({
  productId: z.string().min(1),
  platforms: z.array(z.enum(["facebook", "instagram", "threads", "x", "blog", "seo_article", "comment", "short_caption"])).min(1),
  tone: z.enum(["friendly", "professional", "casual", "energetic", "minimal"]),
  language: z.enum(["th", "en"]),
  versions: z.number().int().min(1).max(5).default(1),
});

export const POST = withAuth(async (request) => {
  try {
    const payload = bodySchema.parse(await request.json());
    const product = await productService.getById(request.auth.userId, payload.productId);
    const service = new AIContentService(new MockAIProvider());

    const results = await Promise.all(payload.platforms.map(async (platform) => {
      const generated = await service.generate({
        platform,
        tone: payload.tone,
        language: payload.language,
        versions: payload.versions,
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

      const prompt = PromptBuilder.build({
        platform,
        tone: payload.tone,
        language: payload.language,
        versions: payload.versions,
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

      await Promise.all(generated.map((item) => service.saveGenerationHistory({
        userId: request.auth.userId,
        productId: product.id,
        platform,
        tone: payload.tone,
        language: payload.language,
        prompt,
        output: item,
      })));

      return generated;
    }));

    return NextResponse.json({ ok: true, data: results });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to batch generate content" } }, { status: 500 });
  }
});
