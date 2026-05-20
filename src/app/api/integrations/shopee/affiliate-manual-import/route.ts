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
      return NextResponse.json({ ok: false, error: { code: "MISSING_PRODUCT", message: "กรุณาเลือกสินค้าเพื่อผูก affiliate link" } }, { status: 422 });
    }

    try {
      const updated = await productService.updateAffiliateLink(request.auth.userId, input.productId, input.affiliateUrl);
      return NextResponse.json({ ok: true, data: { mode: "product", productId: updated.id, affiliateUrl: updated.affiliateUrl, productUrl: input.productUrl }, reviewRequired: true });
    } catch {
      return NextResponse.json({ ok: false, error: { code: "MISSING_PRODUCT", message: "ไม่พบสินค้าที่เลือก หรือคุณไม่มีสิทธิ์เข้าถึง" } }, { status: 404 });
    }
  }

  const created = await productService.create(request.auth.userId, {
    title: input.title ?? "Shopee Affiliate Import",
    price: input.price ?? 0,
    currency: "THB",
    originalUrl: input.productUrl,
    affiliateUrl: input.affiliateUrl,
    images: [],
  });

  return NextResponse.json({
    ok: true,
    data: {
      mode: "affiliate-link",
      productId: created.id,
      affiliateUrl: created.affiliateUrl,
      productUrl: created.originalUrl,
      campaignNote: input.campaignNote ?? null,
    },
    reviewRequired: true,
    disclosure: "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข",
  }, { status: 201 });
});
