import { NextResponse } from "next/server";
import { extensionImportSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function POST(request: Request) {
  const input = extensionImportSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: productService.importFromExtension(input.payload), compliance: "Payload must come from data visible to user and submitted by user." }, { status: 201 });
}
