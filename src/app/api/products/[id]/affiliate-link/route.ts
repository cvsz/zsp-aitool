import { NextResponse } from "next/server";
import { affiliateLinkSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { withAuth } from "@/middleware/auth-middleware";

export const PATCH = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const input = affiliateLinkSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: await productService.updateAffiliateLink(request.auth.userId, (await context.params).id, input.affiliateUrl) });
});
