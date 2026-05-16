import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { updateProductSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try { return NextResponse.json({ ok: true, data: productService.getById(params.id) }); }
  catch (e) { const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 }); }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const input = updateProductSchema.parse(await request.json());
    return NextResponse.json({ ok: true, data: productService.update(params.id, input) });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ ok: false, error: e.flatten() }, { status: 422 });
    const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try { productService.softDelete(params.id); return NextResponse.json({ ok: true }); }
  catch (e) { const err = e as AppError; return NextResponse.json({ ok: false, error: { code: err.code, message: err.message } }, { status: err.status || 500 }); }
}
