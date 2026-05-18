import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";
import { hyperframesVariantsRequestSchema } from "@/schemas/hyperframes-variants.schema";
import { generatePlatformVariants } from "@/services/hyperframes-variants-service";

export const POST = withAuth(async (request) => {
  try {
    const payload = hyperframesVariantsRequestSchema.parse(await request.json());
    const variants = await generatePlatformVariants(request.auth.userId, payload);
    return NextResponse.json({ ok: true, data: { variants, renderTriggered: false } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    }
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }
    if (error instanceof Error && error.message === "BASE_SCRIPT_NOT_FOUND") {
      return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Base script not found" } }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: { code: "VARIANT_GENERATION_FAILED", message: "ไม่สามารถสร้าง variant ได้" } }, { status: 400 });
  }
});
