import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { manualAffiliateImportSchema } from "@/schemas/shopee-affiliate.schema";
import { shopeeAffiliateIngestionService } from "@/services/ShopeeAffiliateIngestionService";

export const POST = withAuth(async (request) => {
  const parsed = manualAffiliateImportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "ข้อมูลลิงก์ไม่ถูกต้อง", details: parsed.error.flatten() } }, { status: 422 });
  }

  const input = parsed.data;
  const queueDraft = shopeeAffiliateIngestionService.validateManualDraft({
    affiliateUrl: input.affiliateUrl,
    productUrl: input.productUrl,
    campaignNote: input.campaignNote,
    title: input.title,
    price: input.price,
  });

  if (queueDraft.status === "rejected") {
    return NextResponse.json({ ok: false, error: { code: "UNSAFE_URL", message: queueDraft.errorSummary } }, { status: 422 });
  }

  const created = await shopeeAffiliateIngestionService.createPending(request.auth.userId, {
    affiliateUrl: input.affiliateUrl,
    productUrl: input.productUrl,
    campaignNote: input.campaignNote,
    title: input.title ?? "Shopee Affiliate Import",
    price: input.price,
    productId: input.saveMode === "product" ? input.productId : undefined,
    source: "manual",
  });

  return NextResponse.json({
    ok: true,
    data: created,
    reviewRequired: true,
    queueStatus: created.status,
    disclosure: "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข",
  }, { status: 201 });
});
