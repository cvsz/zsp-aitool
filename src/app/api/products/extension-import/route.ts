import { NextResponse } from "next/server";
import { extensionImportSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function POST(request: Request) {
  const input = extensionImportSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: await productService.importFromExtension(process.env.DEFAULT_USER_ID ?? "demo-user", { ...input.payload, price: input.payload.price ?? 0, currency: input.payload.currency ?? "THB", images: input.payload.images ?? [] }), compliance: "Payload must come from data visible to user and submitted by user." }, { status: 201 });
}
