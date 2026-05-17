import { NextResponse } from "next/server";
import { importJsonSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function POST(request: Request) {
  const input = importJsonSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: await productService.importJson(process.env.DEFAULT_USER_ID ?? "demo-user", input.products) });
}
