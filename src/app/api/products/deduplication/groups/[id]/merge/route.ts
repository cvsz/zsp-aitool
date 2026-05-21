import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/middleware/auth-middleware";
import { productDeduplicationService } from "@/services/ProductDeduplicationService";
import { AppError } from "@/lib/errors";
const schema = z.object({ canonicalProductId: z.string().cuid() });
export const POST = withAuth(async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const body = schema.parse(await request.json());
    const route = await params;
    return NextResponse.json({ ok: true, data: await productDeduplicationService.mergeGroup(request.auth.userId, route.id, body.canonicalProductId) });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid merge payload" } }, { status: 422 });
  }
});
