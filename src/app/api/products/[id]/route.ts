import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { updateProductSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try { const userId = process.env.DEFAULT_USER_ID ?? "demo-user"; return NextResponse.json({ ok: true, data: await productService.getById(userId, (await context.params).id) }); }
  catch (e) { const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 }); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const input = updateProductSchema.parse(await request.json());
    const userId = process.env.DEFAULT_USER_ID ?? "demo-user";
    return NextResponse.json({ ok: true, data: await productService.update(userId, (await context.params).id, input) });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ ok: false, error: e.flatten() }, { status: 422 });
    const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try { const userId = process.env.DEFAULT_USER_ID ?? "demo-user"; await productService.softDelete(userId, (await context.params).id); return NextResponse.json({ ok: true }); }
  catch (e) { const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 }); }
}
