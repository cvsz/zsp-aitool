import { NextResponse } from "next/server";
import { z } from "zod";
import { Language, Platform, Tone } from "@prisma/client";
import { withAuth } from "@/middleware/auth-middleware";
import { aiContentQueueService } from "@/services/AIContentQueueService";
import { AppError } from "@/lib/errors";

const enqueueSchema = z.object({ productIds: z.array(z.string().min(1)).min(1), kind: z.string().min(1), platform: z.nativeEnum(Platform).optional(), tone: z.nativeEnum(Tone).optional(), language: z.nativeEnum(Language).optional(), input: z.record(z.any()).optional() });

export const POST = withAuth(async (request) => {
  try { const payload = enqueueSchema.parse(await request.json()); const jobs = await aiContentQueueService.enqueue({ userId: request.auth.userId, ...payload }); return NextResponse.json({ ok: true, data: jobs }); }
  catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 }); if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status }); return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to enqueue jobs" } }, { status: 500 }); }
});

export const GET = withAuth(async (request) => {
  const jobs = await aiContentQueueService.list(request.auth.userId);
  return NextResponse.json({ ok: true, data: jobs });
});
