import { NextResponse } from "next/server";
import { extensionImportSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { withAuth } from "@/middleware/auth-middleware";

export const POST = withAuth(async (request) => {
  const input = extensionImportSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: await productService.importFromExtension(request.auth.userId, { ...input.payload, price: input.payload.price ?? 0, currency: input.payload.currency ?? "THB", images: input.payload.images ?? [] }), compliance: "Payload must come from data visible to user and submitted by user." }, { status: 201 });
});
