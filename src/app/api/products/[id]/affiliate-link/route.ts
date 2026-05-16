import { NextResponse } from "next/server";
import { affiliateLinkSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const input = affiliateLinkSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: productService.updateAffiliateLink(params.id, input.affiliateUrl) });
}
