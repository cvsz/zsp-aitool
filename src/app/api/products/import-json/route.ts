import { NextResponse } from "next/server";
import { importJsonSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { withAuth } from "@/middleware/auth-middleware";

export const POST = withAuth(async (request) => {
  const input = importJsonSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: await productService.importJson(request.auth.userId, input.products) });
});
