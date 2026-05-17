import { NextResponse } from "next/server";
import { Language, Platform, Tone } from "@prisma/client";
import { z } from "zod";
import { success, failure } from "@/lib/api-response";
import { ProductService } from "@/services/product-service";
import { AIContentService } from "@/services/ai-content-service";
import { env } from "@/lib/env";
import { enforceUsageQuota } from "@/lib/usage-guard";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  productId: z.string().min(1),
  platform: z.nativeEnum(Platform),
  tone: z.nativeEnum(Tone),
  language: z.nativeEnum(Language),
  versions: z.number().int().min(1).max(10),
  customPrompt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const quota = enforceUsageQuota({ request, namespace: "ai", maxRequestsPerMinute: env.AI_MAX_REQUESTS_PER_MINUTE });
    if (!quota.allowed) {
      return NextResponse.json(failure("RATE_LIMITED", "AI request quota exceeded. Please retry later."), { status: 429 });
    }

    const payload = bodySchema.parse(await request.json());
    const defaultEmail = process.env.DEFAULT_USER_EMAIL ?? "demo@zsp.local";
    const user = await prisma.user.upsert({ where: { email: defaultEmail }, update: {}, create: { email: defaultEmail, name: "Demo User" } });
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
      userId: user.id,
      productId: product.id,
      platform: payload.platform,
      tone: payload.tone,
      language: payload.language,
      prompt: payload.customPrompt ?? "",
      output: generated.outputs,
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
