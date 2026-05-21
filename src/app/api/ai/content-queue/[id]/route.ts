import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { aiContentQueueService } from "@/services/AIContentQueueService";
import { AppError } from "@/lib/errors";

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try { const data = await aiContentQueueService.getById(request.auth.userId, id); return NextResponse.json({ ok: true, data }); }
  catch (error) { if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status }); return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch queue job" } }, { status: 500 }); }
});
