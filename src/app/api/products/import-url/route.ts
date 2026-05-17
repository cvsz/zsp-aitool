import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { importUrlSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { AppError } from "@/lib/errors";
import { withAuth } from "@/middleware/auth-middleware";

export const POST = withAuth(async (request) => {
  try {
    const input = importUrlSchema.parse(await request.json());
    return NextResponse.json({ ok: true, data: await productService.importByUrl(request.auth.userId, input.originalUrl), compliance: "No private endpoint scraping. User must confirm details manually." });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } }, { status: 500 });
  }
});
