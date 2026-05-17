import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { updateProductSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try { return NextResponse.json({ ok: true, data: await productService.getById(request.auth.userId, (await context.params).id) }); }
  catch (e) { const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 }); }
});

export const PATCH = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try {
    const input = updateProductSchema.parse(await request.json());
    return NextResponse.json({ ok: true, data: await productService.update(request.auth.userId, (await context.params).id, input) });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ ok: false, error: e.flatten() }, { status: 422 });
    const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 });
  }
});

export const DELETE = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try { await productService.softDelete(request.auth.userId, (await context.params).id); return NextResponse.json({ ok: true }); }
  catch (e) { const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 }); }
});
