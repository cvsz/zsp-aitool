import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { productDeduplicationService } from "@/services/ProductDeduplicationService";
import { AppError } from "@/lib/errors";
export const POST = withAuth(async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const route = await params;
    return NextResponse.json({ ok: true, data: await productDeduplicationService.dismiss(request.auth.userId, route.id) });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } }, { status: 500 });
  }
});
