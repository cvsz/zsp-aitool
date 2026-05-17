import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { createProductSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { AppError } from "@/lib/errors";

export async function GET() {
  return NextResponse.json({ ok: true, data: productService.list() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createProductSchema.parse(body);
    return NextResponse.json({ ok: true, data: productService.create(input) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { ok: false, error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } },
      { status: 500 },
    );
  }
}
