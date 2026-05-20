import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { manualAffiliateImportSchema } from "@/schemas/shopee-affiliate.schema";
import { productService } from "@/services/ProductService";

export const POST = withAuth(async (request) => {
  const parsed = manualAffiliateImportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "ข้อมูลลิงก์ไม่ถูกต้อง", details: parsed.error.flatten() } }, { status: 422 });
  }

  const input = parsed.data;
  if (input.saveMode === "product") {
    if (!input.productId) {
      return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "กรุณาเลือกสินค้าเพื่อผูก affiliate link" } }, { status: 422 });
    }
    const updated = await productService.updateAffiliateLink(request.auth.userId, input.productId, input.affiliateUrl);
    return NextResponse.json({ ok: true, data: { mode: "product", productId: updated.id, affiliateUrl: updated.affiliateUrl }, reviewRequired: true });
  }

  const created = await productService.create(request.auth.userId, {
    title: input.title ?? "Shopee Affiliate Import",
    price: input.price ?? 0,
    currency: "THB",
    originalUrl: input.productUrl,
    affiliateUrl: input.affiliateUrl,
    images: [],
  });
  return NextResponse.json({ ok: true, data: { mode: "affiliate-link", productId: created.id, affiliateUrl: created.affiliateUrl }, reviewRequired: true }, { status: 201 });
});
