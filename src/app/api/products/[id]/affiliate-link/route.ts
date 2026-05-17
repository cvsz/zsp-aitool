import { NextResponse } from "next/server";
import { affiliateLinkSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const input = affiliateLinkSchema.parse(await request.json());
  const userId = process.env.DEFAULT_USER_ID ?? "demo-user";
  return NextResponse.json({ ok: true, data: await productService.updateAffiliateLink(userId, (await context.params).id, input.affiliateUrl) });
}
