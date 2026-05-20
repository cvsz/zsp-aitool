import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { csvImportPreviewSchema } from "@/schemas/shopee-affiliate.schema";
import { shopeeAffiliateIngestionService } from "@/services/ShopeeAffiliateIngestionService";

export const POST = withAuth(async (request) => {
  const parsed = csvImportPreviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "CSV ไม่ถูกต้อง", details: parsed.error.flatten() } }, { status: 422 });
  }

  try {
    const { preview, created } = await shopeeAffiliateIngestionService.persistCsvPreview(request.auth.userId, parsed.data.csv);
    const importResults = parsed.data.importProducts
      ? await shopeeAffiliateIngestionService.importMany(request.auth.userId, created.map((item) => item.id))
      : [];
    const importedCount = importResults.filter((item) => item.ok).length;
    const importFailedCount = importResults.length - importedCount;

    return NextResponse.json({
      ok: true,
      data: {
        headers: preview.headers,
        rowCount: preview.rowCount,
        previewRows: preview.previewRows,
        detectedColumns: preview.detectedColumns,
        rejectedRowIndexes: preview.rejectedRowIndexes,
        createdIngestionCount: created.length,
        createdIngestions: created,
        pendingReviewCount: created.filter((x) => x.status === "pending_review").length,
        rejectedCount: preview.queueItems.filter((x) => x.status === "rejected").length + preview.rejectedRowIndexes.length,
        missingRecommendedColumns: ["affiliate_url", "product_url"].filter((key) => !preview.detectedColumns.includes(key)),
        columnMappingRequired: preview.detectedColumns.length === 0,
        importRequested: parsed.data.importProducts,
        importedProductCount: importedCount,
        importFailedCount,
        importResults,
      },
      reviewRequired: !parsed.data.importProducts,
      queueStatus: parsed.data.importProducts ? "imported_or_failed" : "pending_review",
    }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "CSV_PREVIEW_FAILED";
    const message = code === "CSV_FILE_TOO_LARGE"
      ? "ไฟล์ CSV ใหญ่เกินกำหนด"
      : code === "CSV_ROW_LIMIT_EXCEEDED"
      ? "จำนวนแถวเกินกำหนด"
      : code === "EMPTY_CSV"
      ? "CSV ว่างเปล่า"
      : "ไม่สามารถประมวลผล CSV ได้";
    return NextResponse.json({ ok: false, error: { code, message } }, { status: 422 });
  }
});
