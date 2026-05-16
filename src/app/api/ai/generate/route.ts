import { NextResponse } from "next/server";
import { Platform, Tone } from "@prisma/client";
import { z } from "zod";
import { success, failure } from "@/lib/api-response";
import { ProductService } from "@/services/product-service";
import { AIContentService } from "@/services/ai-content-service";

const bodySchema = z.object({
  productId: z.string().min(1),
  platform: z.nativeEnum(Platform),
  tone: z.nativeEnum(Tone),
  language: z.string().min(2),
  versions: z.number().int().min(1).max(10),
  customPrompt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());
    const product = await ProductService.getProductById(payload.productId);

    if (!product) {
      return NextResponse.json(failure("NOT_FOUND", "Product not found"), { status: 404 });
    }

    const generated = await AIContentService.generateContent({
      product,
      platform: payload.platform,
      tone: payload.tone,
      language: payload.language,
      versions: payload.versions,
      customPrompt: payload.customPrompt,
    });

    const history = await AIContentService.saveGenerationHistory({
      productId: product.id,
      platform: payload.platform,
      tone: payload.tone,
      language: payload.language,
      customPrompt: payload.customPrompt,
      versions: payload.versions,
      outputJson: generated.outputs,
      tokenUsage: Math.round(generated.tokenUsage),
    });

    return NextResponse.json(success({ historyId: history.id, ...generated }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(failure("VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid input"), { status: 400 });
    }

    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to generate content"), { status: 500 });
  }
}
