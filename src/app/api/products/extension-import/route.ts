import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { extensionImportSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { AppError } from "@/lib/errors";
import { withAuth } from "@/middleware/auth-middleware";

export const POST = withAuth(async (request) => {
  try {
    const input = extensionImportSchema.parse(await request.json());
    return NextResponse.json({ ok: true, data: await productService.importFromExtension(request.auth.userId, { ...input.payload, price: input.payload.price ?? 0, currency: input.payload.currency ?? "THB", images: input.payload.images ?? [] }), compliance: "Payload must come from data visible to user and submitted by user." }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } }, { status: 500 });
  }
});
