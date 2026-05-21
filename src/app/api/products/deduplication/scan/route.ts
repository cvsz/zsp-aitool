import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/middleware/auth-middleware";
import { productDeduplicationService } from "@/services/ProductDeduplicationService";
const schema = z.object({ limit: z.number().int().min(10).max(500).optional() });
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = schema.parse(body);
    return NextResponse.json({ ok: true, data: await productDeduplicationService.scan(request.auth.userId, parsed.limit) });
  } catch { return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid scan payload" } }, { status: 422 }); }
});
