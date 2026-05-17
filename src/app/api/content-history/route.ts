import { NextResponse } from "next/server";
import { z } from "zod";
import { JobStatus, Language, Platform, Tone } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { success, failure } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";

const createSchema = z.object({
  productId: z.string().min(1),
  platform: z.enum(["facebook", "instagram", "threads", "x", "blog", "seo_article", "comment", "short_caption"]),
  tone: z.enum(["friendly", "professional", "casual", "energetic", "minimal"]),
  language: z.enum(["th", "en"]),
  prompt: z.string().min(1),
  output: z.any(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
});

export const GET = withAuth(async (request) => {
  try {
    const rows = await prisma.contentGeneration.findMany({
      where: { userId: request.auth.userId, deletedAt: null },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(success(rows));
  } catch {
    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to load content history"), { status: 500 });
  }
});

export const POST = withAuth(async (request) => {
  try {
    const payload = createSchema.parse(await request.json());
    const row = await prisma.contentGeneration.create({
      data: {
        userId: request.auth.userId,
        productId: payload.productId,
        platform: payload.platform.toUpperCase() as Platform,
        tone: payload.tone.toUpperCase() as Tone,
        language: payload.language.toUpperCase() as Language,
        prompt: payload.prompt,
        output: payload.output,
        status: (payload.status as JobStatus | undefined) ?? JobStatus.COMPLETED,
      },
    });
    return NextResponse.json(success(row), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(failure("VALIDATION_ERROR", "Invalid request payload", error.flatten()), { status: 422 });
    }
    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to create content history"), { status: 500 });
  }
});
