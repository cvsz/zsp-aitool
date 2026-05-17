import { NextResponse } from "next/server";
import { importUrlSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { withAuth } from "@/middleware/auth-middleware";

export const POST = withAuth(async (request) => {
  const input = importUrlSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: await productService.importByUrl(request.auth.userId, input.originalUrl), compliance: "No private endpoint scraping. User must confirm details manually." });
});
