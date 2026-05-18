import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";
import { productService } from "@/services/ProductService";
import { hyperframesScriptRequestSchema } from "@/schemas/hyperframes-script.schema";
import { generateHyperframesScript } from "@/services/hyperframes-script-service";

export const POST = withAuth(async (request) => {
  try {
    const input = hyperframesScriptRequestSchema.parse(await request.json());
    const product = await productService.getById(request.auth.userId, input.productId);
    const data = await generateHyperframesScript(request.auth.userId, input, {
      id: product.id,
      title: product.title,
      description: product.description,
      price: String(product.price),
      currency: product.currency,
      category: product.category,
      shopName: product.shopName,
      affiliateUrl: product.affiliateUrl,
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    return NextResponse.json({ ok: false, error: { code: "SCRIPT_GENERATION_FAILED", message: "ไม่สามารถสร้างสคริปต์วิดีโอได้" } }, { status: 400 });
  }
});
