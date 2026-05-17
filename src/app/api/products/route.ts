import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { createProductSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { AppError } from "@/lib/errors";

export async function GET() {
  const userId = process.env.DEFAULT_USER_ID ?? "demo-user";
  return NextResponse.json({ ok: true, data: await productService.list(userId) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createProductSchema.parse(body);
    const userId = process.env.DEFAULT_USER_ID ?? "demo-user";
    return NextResponse.json({ ok: true, data: await productService.create(userId, input) }, { status: 201 });
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
