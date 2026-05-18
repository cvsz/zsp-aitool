import { NextResponse } from "next/server";

import { withAuth } from "@/middleware/auth-middleware";
import { AppError } from "@/lib/errors";
import { getHyperframesBrandKit, upsertHyperframesBrandKit } from "@/services/hyperframes-brand-kit-service";

export const GET = withAuth(async (request) => {
  try {
    return NextResponse.json({ ok: true, data: await getHyperframesBrandKit(request.auth.userId) });
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", "Failed to load brand kit", 500);
    return NextResponse.json({ ok: false, error: { code: appError.code, message: appError.message } }, { status: appError.status });
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json();
    return NextResponse.json({ ok: true, data: await upsertHyperframesBrandKit(request.auth.userId, body) });
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", "Failed to save brand kit", 500);
    return NextResponse.json({ ok: false, error: { code: appError.code, message: appError.message } }, { status: appError.status });
  }
});
