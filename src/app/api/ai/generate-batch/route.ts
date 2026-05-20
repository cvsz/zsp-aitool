import { NextResponse } from "next/server";
import { z } from "zod";
import { JobStatus } from "@prisma/client";
import { MockAIProvider } from "@/services/ai/MockAIProvider";
import { AIContentService } from "@/services/AIContentService";
import { productService } from "@/services/ProductService";
import { BudgetService } from "@/services/BudgetService";
import { withAuth } from "@/middleware/auth-middleware";
import { AppError } from "@/lib/errors";

const platformSchema = z.enum(["facebook", "instagram", "threads", "x", "blog", "seo_article", "comment", "short_caption"]);

const bodySchema = z.object({
  productId: z.string().min(1).optional(),
  productIds: z.array(z.string().min(1)).min(1).optional(),
  platforms: z.array(platformSchema).min(1),
  tone: z.enum(["friendly", "professional", "casual", "energetic", "minimal"]),
  language: z.enum(["th", "en"]),
  versions: z.number().int().min(1).max(5).default(1),
}).refine((v) => Boolean(v.productId || v.productIds?.length), { message: "productId or productIds is required", path: ["productId"] });

export const POST = withAuth(async (request) => {
  try {
    const payload = bodySchema.parse(await request.json());
    await BudgetService.checkBudget(request.auth.userId);

    const uniqueProductIds = Array.from(new Set([...(payload.productId ? [payload.productId] : []), ...(payload.productIds ?? [])]));
    const service = new AIContentService(new MockAIProvider());

    const results = await Promise.all(uniqueProductIds.map(async (productId) => {
      try {
        const product = await productService.getById(request.auth.userId, productId);
        const platformResults = await Promise.all(payload.platforms.map(async (platform) => {
          const generationInput = {
            platform,
            tone: payload.tone,
            language: payload.language,
            versions: payload.versions,
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
          const generated = await service.generate(generationInput);

          // AI cost: 0.005 USD per version generated
          const costPerVersion = 0.005;
          const totalCost = costPerVersion * generated.length;
          await BudgetService.logUsage(
            request.auth.userId,
            "mock",
            "/api/ai/generate-batch",
            totalCost,
            JobStatus.COMPLETED,
            { versions: generated.length, productId: product.id, platform }
          );

          await Promise.all(generated.map((item) => service.saveGenerationHistory({
            userId: request.auth.userId,
            productId: product.id,
            platform,
            tone: payload.tone,
            language: payload.language,
            prompt,
            output: item,
          })));

          return { platform, outputs: generated };
        }));

        return { productId, ok: true, results: platformResults };
      } catch (error) {
        if (error instanceof AppError && error.code === "NOT_FOUND") {
          return { productId, ok: false, error: { code: "NOT_FOUND", message: "Product not found" } };
        }
        return { productId, ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate content" } };
      }
    }));

    const hasFailure = results.some((item) => !item.ok);
    return NextResponse.json({ ok: !hasFailure, data: results }, { status: hasFailure ? 207 : 200 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to batch generate content" } }, { status: 500 });
  }
});

