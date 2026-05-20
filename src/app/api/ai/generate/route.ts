import { NextResponse } from "next/server";
import { z } from "zod";
import { JobStatus } from "@prisma/client";
import { MockAIProvider } from "@/services/ai/MockAIProvider";
import { AIContentService } from "@/services/AIContentService";
import { productService } from "@/services/ProductService";
import { BudgetService } from "@/services/BudgetService";
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
    await BudgetService.checkBudget(request.auth.userId);

    const product = await productService.getById(request.auth.userId, payload.productId);
    const service = new AIContentService(new MockAIProvider());
    const generationInput = {
      ...payload,
      contentLength: "medium" as const,
      product: {
        title: product.title,
        description: product.description ?? undefined,
        price: Number(product.price),
        currency: product.currency,
        shopName: product.shopName ?? undefined,
        rating: product.rating == null ? undefined : Number(product.rating),
        soldCount: product.soldCount ?? undefined,
        category: product.category ?? undefined,
        affiliateUrl: product.affiliateUrl ?? undefined,
      },
    };

    const prompt = service.buildPrompt(generationInput);
    const outputs = await service.generate(generationInput);

    // AI cost: 0.005 USD per version generated
    const costPerVersion = 0.005;
    const totalCost = costPerVersion * outputs.length;
    await BudgetService.logUsage(
      request.auth.userId,
      "mock",
      "/api/ai/generate",
      totalCost,
      JobStatus.COMPLETED,
      { versions: outputs.length, productId: payload.productId }
    );

    await Promise.all(outputs.map((item) => service.saveGenerationHistory({
      userId: request.auth.userId,
      productId: product.id,
      platform: payload.platform,
      tone: payload.tone,
      language: payload.language,
      prompt,
      output: item,
    })));
    return NextResponse.json({ ok: true, data: outputs });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate content" } }, { status: 500 });
  }
});

