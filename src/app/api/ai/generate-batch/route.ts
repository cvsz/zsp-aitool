import { NextResponse } from "next/server";
import { z } from "zod";
import { MockAIProvider } from "@/services/ai/MockAIProvider";
import { AIContentService } from "@/services/AIContentService";
import { productService } from "@/services/ProductService";
import { withAuth } from "@/middleware/auth-middleware";

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

    const results = await Promise.all(payload.platforms.map((platform) => service.generate({
      platform,
      tone: payload.tone,
      language: payload.language,
      versions: payload.versions,
      contentLength: "medium",
      product: { title: product.title },
    })));

    return NextResponse.json({ ok: true, data: results });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to batch generate content" } }, { status: 500 });
  }
});
