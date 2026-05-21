import { Platform, Prisma, ShopeeAffiliateIngestionSource, ShopeeAffiliateIngestionStatus } from "@prisma/client";

import { isAllowedShopeeAffiliateUrl } from "@/lib/shopee-affiliate-url-safety";
import { prisma } from "@/lib/prisma";

export type ShopeeAffiliateIngestionSourceName = "manual" | "csv" | "extension" | "open_api_future";
export type ShopeeAffiliateQueueStatus = "pending_review" | "approved" | "rejected" | "imported" | "failed";

export interface AffiliateDraftRecord {
  affiliateUrl: string;
  productUrl: string;
  title?: string;
  campaignNote?: string;
  price?: number;
  source: ShopeeAffiliateIngestionSourceName;
}

export interface IngestionQueuePayload {
  source: ShopeeAffiliateIngestionSourceName;
  status: ShopeeAffiliateQueueStatus;
  payload: AffiliateDraftRecord;
  errorSummary: string | null;
  rowIndex?: number;
}

export interface PersistManualDraftInput {
  affiliateUrl: string;
  productUrl: string;
  title?: string;
  campaignNote?: string;
  price?: number;
  productId?: string;
  rowIndex?: number;
  source?: ShopeeAffiliateIngestionSourceName;
}

const FORMULA_PREFIX_RE = /^[\t\r\s]*[=+\-@]/;
const MAX_CSV_ROWS = 1_000;
const MAX_CSV_BYTES = 1_000_000;
const SUPPORTED_COLUMNS = [
  "affiliate_url",
  "product_url",
  "title",
  "campaign",
  "commission_rate",
  "commission_amount",
  "category",
  "shop_name",
  "source",
  "price",
  "product_id",
  "sold_count",
] as const;

type SupportedColumn = (typeof SUPPORTED_COLUMNS)[number];

const DATAFEED_HEADER_MAP = new Map<string, SupportedColumn>([
  ["รหัสสินค้า", "product_id"],
  ["ชื่อข้อเสนอ", "title"],
  ["ชื่อสินค้า", "title"],
  ["ราคา", "price"],
  ["ขาย", "sold_count"],
  ["ชื่อร้านค้า", "shop_name"],
  ["อัตราค่าคอมมิชชัน", "commission_rate"],
  ["ค่าคอมมิชชัน", "commission_amount"],
  ["คอมมิชชัน", "commission_amount"],
  ["ลิงก์ข้อเสนอ", "affiliate_url"],
  ["ลิงก์สินค้า", "product_url"],
  ["ลิงก์ร้านค้า", "product_url"],
  ["ลิงก์สินค้า(สั้น)", "affiliate_url"],
  ["ลิงก์ร้านค้า(สั้น)", "affiliate_url"],
  ["ลิงก์สั้น", "affiliate_url"],
  ["หมวดหมู่", "category"],
  ["หมวดหมู่สากล", "category"],
  ["product id", "product_id"],
  ["product_id", "product_id"],
  ["item id", "product_id"],
  ["item_id", "product_id"],
  ["affiliate url", "affiliate_url"],
  ["affiliate_url", "affiliate_url"],
  ["affiliate link", "affiliate_url"],
  ["affiliate_link", "affiliate_url"],
  ["tracking link", "affiliate_url"],
  ["tracking_link", "affiliate_url"],
  ["deeplink", "affiliate_url"],
  ["deep link", "affiliate_url"],
  ["short link", "affiliate_url"],
  ["short_link", "affiliate_url"],
  ["short url", "affiliate_url"],
  ["short_url", "affiliate_url"],
  ["offer url", "affiliate_url"],
  ["offer_url", "affiliate_url"],
  ["offer link", "affiliate_url"],
  ["offer_link", "affiliate_url"],
  ["product url", "product_url"],
  ["product_url", "product_url"],
  ["product link", "product_url"],
  ["product_link", "product_url"],
  ["shop url", "product_url"],
  ["shop_url", "product_url"],
  ["shop link", "product_url"],
  ["shop_link", "product_url"],
  ["landing page url", "product_url"],
  ["landing_page_url", "product_url"],
  ["landing page", "product_url"],
  ["origin link", "product_url"],
  ["origin_link", "product_url"],
  ["offer name", "title"],
  ["offer_name", "title"],
  ["product name", "title"],
  ["product_name", "title"],
  ["item name", "title"],
  ["item_name", "title"],
  ["name", "title"],
  ["title", "title"],
  ["shop name", "shop_name"],
  ["shop_name", "shop_name"],
  ["seller name", "shop_name"],
  ["seller_name", "shop_name"],
  ["commission", "commission_amount"],
  ["commission amount", "commission_amount"],
  ["commission_amount", "commission_amount"],
  ["commission rate", "commission_rate"],
  ["commission_rate", "commission_rate"],
  ["commission %", "commission_rate"],
  ["payout", "commission_amount"],
  ["campaign", "campaign"],
  ["sold", "sold_count"],
  ["sold count", "sold_count"],
  ["sold_count", "sold_count"],
  ["global category", "category"],
  ["global_category", "category"],
  ["all global category", "category"],
  ["category", "category"],
  ["category name", "category"],
  ["category_name", "category"],
  ["main category", "category"],
  ["main_category", "category"],
  ["sp-product-feed-all-global-category.csv", "source"],
  ["price", "price"],
  ["sale price", "price"],
  ["sale_price", "price"],
]);

const THAI_DATAFEED_HEADER_MAP = DATAFEED_HEADER_MAP;
const SP_PRODUCT_FEED_ALL_GLOBAL_CATEGORY_FILENAME = "SP-Product-Feed-All-Global-Category.csv";

const sourceToDb: Record<ShopeeAffiliateIngestionSourceName, ShopeeAffiliateIngestionSource> = {
  manual: ShopeeAffiliateIngestionSource.MANUAL,
  csv: ShopeeAffiliateIngestionSource.CSV,
  extension: ShopeeAffiliateIngestionSource.EXTENSION,
  open_api_future: ShopeeAffiliateIngestionSource.OPEN_API_FUTURE,
};

const sourceFromDb: Record<ShopeeAffiliateIngestionSource, ShopeeAffiliateIngestionSourceName> = {
  MANUAL: "manual",
  CSV: "csv",
  EXTENSION: "extension",
  OPEN_API_FUTURE: "open_api_future",
};

const statusToDb: Record<ShopeeAffiliateQueueStatus, ShopeeAffiliateIngestionStatus> = {
  pending_review: ShopeeAffiliateIngestionStatus.PENDING_REVIEW,
  approved: ShopeeAffiliateIngestionStatus.APPROVED,
  rejected: ShopeeAffiliateIngestionStatus.REJECTED,
  imported: ShopeeAffiliateIngestionStatus.IMPORTED,
  failed: ShopeeAffiliateIngestionStatus.FAILED,
};

const statusFromDb: Record<ShopeeAffiliateIngestionStatus, ShopeeAffiliateQueueStatus> = {
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  IMPORTED: "imported",
  FAILED: "failed",
};

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, "").replace(/^"|"$/g, "").trim();
}

function toCanonicalHeader(header: string): string {
  const normalized = normalizeHeader(header);
  const lower = normalized.toLowerCase();
  return DATAFEED_HEADER_MAP.get(normalized) ?? DATAFEED_HEADER_MAP.get(lower) ?? lower;
}

function detectDelimiter(headerLine: string): "," | "\t" {
  return headerLine.includes("\t") ? "\t" : ",";
}

function parseDelimitedLine(line: string, delimiter: "," | "\t"): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  out.push(current.trim());
  return out;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const clean = value.replace(/[฿,\s]/g, "").replace(/\+$/, "");
  const multiplier = clean.endsWith("พัน") ? 1_000 : clean.endsWith("หมื่น") ? 10_000 : clean.endsWith("แสน") ? 100_000 : clean.endsWith("ล้าน") ? 1_000_000 : 1;
  const numeric = clean.replace(/(พัน|หมื่น|แสน|ล้าน)$/u, "");
  const parsed = Number(numeric);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed * multiplier;
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

function buildCampaignNote(entry: Record<string, string>): string | undefined {
  const parts = [
    firstNonEmpty(entry.campaign),
    firstNonEmpty(entry.commission_rate) ? `อัตราค่าคอมมิชชัน: ${firstNonEmpty(entry.commission_rate)}` : undefined,
    firstNonEmpty(entry.commission_amount) ? `คอมมิชชัน: ${firstNonEmpty(entry.commission_amount)}` : undefined,
    firstNonEmpty(entry.sold_count) ? `ขาย: ${firstNonEmpty(entry.sold_count)}` : undefined,
    firstNonEmpty(entry.category) ? `หมวดหมู่: ${firstNonEmpty(entry.category)}` : undefined,
    firstNonEmpty(entry.shop_name) ? `ร้านค้า: ${firstNonEmpty(entry.shop_name)}` : undefined,
  ].filter((value): value is string => Boolean(value));
  return parts.length ? parts.join(" · ") : undefined;
}

function toSafeIngestionRecord(record: {
  id: string;
  source: ShopeeAffiliateIngestionSource;
  status: ShopeeAffiliateIngestionStatus;
  affiliateUrl: string | null;
  productUrl: string | null;
  title: string | null;
  campaignNote: string | null;
  price: Prisma.Decimal | null;
  productId: string | null;
  errorSummary: string | null;
  rowIndex: number | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  importedAt: Date | null;
}) {
  return {
    id: record.id,
    source: sourceFromDb[record.source],
    status: statusFromDb[record.status],
    affiliateUrl: record.affiliateUrl,
    productUrl: record.productUrl,
    title: record.title,
    campaignNote: record.campaignNote,
    price: record.price ? Number(record.price) : null,
    productId: record.productId,
    errorSummary: record.errorSummary,
    rowIndex: record.rowIndex,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    importedAt: record.importedAt?.toISOString() ?? null,
  };
}

export class ShopeeAffiliateIngestionService {
  validateManualDraft(input: Omit<AffiliateDraftRecord, "source">, source: ShopeeAffiliateIngestionSourceName = "manual"): IngestionQueuePayload {
    if (!isAllowedShopeeAffiliateUrl(input.affiliateUrl) || !isAllowedShopeeAffiliateUrl(input.productUrl)) {
      return { source, status: "rejected", payload: { ...input, source }, errorSummary: "URL ต้องเป็น Shopee HTTPS ที่อยู่ใน allowlist เท่านั้น" };
    }

    return { source, status: "pending_review", payload: { ...input, source }, errorSummary: null };
  }

  async createPending(userId: string, input: PersistManualDraftInput) {
    const source = input.source ?? "manual";
    const draft = this.validateManualDraft({
      affiliateUrl: input.affiliateUrl,
      productUrl: input.productUrl,
      campaignNote: input.campaignNote,
      title: input.title,
      price: input.price,
    }, source);

    const created = await prisma.shopeeAffiliateIngestion.create({
      data: {
        userId,
        productId: input.productId,
        source: sourceToDb[source],
        status: statusToDb[draft.status],
        affiliateUrl: input.affiliateUrl,
        productUrl: input.productUrl,
        title: input.title,
        campaignNote: input.campaignNote,
        price: input.price == null ? undefined : new Prisma.Decimal(input.price),
        normalizedPayload: draft.payload as unknown as Prisma.InputJsonValue,
        errorSummary: draft.errorSummary,
        rowIndex: input.rowIndex,
      },
    });

    return toSafeIngestionRecord(created);
  }

  async list(userId: string, status?: ShopeeAffiliateQueueStatus) {
    const rows = await prisma.shopeeAffiliateIngestion.findMany({
      where: { userId, deletedAt: null, status: status ? statusToDb[status] : undefined },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map(toSafeIngestionRecord);
  }

  async getSummary(userId: string) {
    const grouped = await prisma.shopeeAffiliateIngestion.groupBy({
      by: ["status"],
      where: { userId, deletedAt: null },
      _count: { _all: true },
    });
    return {
      pendingReview: grouped.find((x) => x.status === "PENDING_REVIEW")?._count._all ?? 0,
      approved: grouped.find((x) => x.status === "APPROVED")?._count._all ?? 0,
      rejected: grouped.find((x) => x.status === "REJECTED")?._count._all ?? 0,
      imported: grouped.find((x) => x.status === "IMPORTED")?._count._all ?? 0,
      failed: grouped.find((x) => x.status === "FAILED")?._count._all ?? 0,
    };
  }

  async approve(userId: string, id: string) {
    const updated = await prisma.shopeeAffiliateIngestion.updateMany({
      where: { id, userId, deletedAt: null, status: ShopeeAffiliateIngestionStatus.PENDING_REVIEW },
      data: { status: ShopeeAffiliateIngestionStatus.APPROVED, reviewedAt: new Date() },
    });
    if (updated.count === 0) throw new Error("INGESTION_NOT_FOUND_OR_NOT_PENDING");
    const record = await prisma.shopeeAffiliateIngestion.findFirstOrThrow({ where: { id, userId } });
    return toSafeIngestionRecord(record);
  }

  async reject(userId: string, id: string, reason = "Rejected by user") {
    const updated = await prisma.shopeeAffiliateIngestion.updateMany({
      where: { id, userId, deletedAt: null },
      data: { status: ShopeeAffiliateIngestionStatus.REJECTED, errorSummary: reason, reviewedAt: new Date() },
    });
    if (updated.count === 0) throw new Error("INGESTION_NOT_FOUND");
    const record = await prisma.shopeeAffiliateIngestion.findFirstOrThrow({ where: { id, userId } });
    return toSafeIngestionRecord(record);
  }

  async importApproved(userId: string, id: string) {
    const ingestion = await prisma.shopeeAffiliateIngestion.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!ingestion) throw new Error("INGESTION_NOT_FOUND");
    if (!ingestion.affiliateUrl || !ingestion.productUrl) throw new Error("INGESTION_MISSING_URLS");
    if (ingestion.status !== ShopeeAffiliateIngestionStatus.APPROVED && ingestion.status !== ShopeeAffiliateIngestionStatus.PENDING_REVIEW) {
      throw new Error("INGESTION_NOT_IMPORTABLE");
    }

    const product = await prisma.product.upsert({
      where: { userId_originalUrl: { userId, originalUrl: ingestion.productUrl } },
      update: {
        affiliateUrl: ingestion.affiliateUrl,
        title: ingestion.title ?? undefined,
        price: ingestion.price ?? undefined,
        rawMetadata: {
          source: "shopee_affiliate_ingestion",
          ingestionId: ingestion.id,
          campaignNote: ingestion.campaignNote,
        },
      },
      create: {
        userId,
        title: ingestion.title ?? "Shopee Affiliate Import",
        price: ingestion.price ?? new Prisma.Decimal(0),
        currency: "THB",
        originalUrl: ingestion.productUrl,
        affiliateUrl: ingestion.affiliateUrl,
        rawMetadata: {
          source: "shopee_affiliate_ingestion",
          ingestionId: ingestion.id,
          campaignNote: ingestion.campaignNote,
        },
      },
    });

    await prisma.affiliateLink.upsert({
      where: { id: `${ingestion.id}-affiliate-link` },
      update: { affiliateUrl: ingestion.affiliateUrl, originalUrl: ingestion.productUrl, productId: product.id },
      create: {
        id: `${ingestion.id}-affiliate-link`,
        userId,
        productId: product.id,
        platform: Platform.FACEBOOK,
        originalUrl: ingestion.productUrl,
        affiliateUrl: ingestion.affiliateUrl,
        trackingCode: ingestion.campaignNote,
      },
    });

    const updated = await prisma.shopeeAffiliateIngestion.update({
      where: { id: ingestion.id },
      data: { status: ShopeeAffiliateIngestionStatus.IMPORTED, productId: product.id, importedAt: new Date() },
    });

    return { ingestion: toSafeIngestionRecord(updated), productId: product.id };
  }

  async importMany(userId: string, ids: string[]) {
    const uniqueIds = [...new Set(ids.filter((id) => id.trim().length > 0))];
    const results: Array<{ id: string; ok: true; productId: string } | { id: string; ok: false; code: string }> = [];

    for (const id of uniqueIds) {
      try {
        const imported = await this.importApproved(userId, id);
        results.push({ id, ok: true, productId: imported.productId });
      } catch (error) {
        const code = error instanceof Error ? error.message : "INGESTION_IMPORT_FAILED";
        results.push({ id, ok: false, code });
      }
    }

    return results;
  }

  async markImported(userId: string, id: string, productId: string) {
    const updated = await prisma.shopeeAffiliateIngestion.updateMany({
      where: { id, userId, deletedAt: null },
      data: { status: ShopeeAffiliateIngestionStatus.IMPORTED, productId, importedAt: new Date() },
    });
    if (updated.count === 0) throw new Error("INGESTION_NOT_FOUND");
    const record = await prisma.shopeeAffiliateIngestion.findFirstOrThrow({ where: { id, userId } });
    return toSafeIngestionRecord(record);
  }

  previewCsv(csv: string): {
    headers: string[];
    detectedColumns: string[];
    rowCount: number;
    previewRows: string[][];
    rejectedRowIndexes: number[];
    queueItems: IngestionQueuePayload[];
  } {
    if (Buffer.byteLength(csv, "utf8") > MAX_CSV_BYTES) throw new Error("CSV_FILE_TOO_LARGE");

    const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) throw new Error("EMPTY_CSV");
    if (lines.length - 1 > MAX_CSV_ROWS) throw new Error("CSV_ROW_LIMIT_EXCEEDED");

    const delimiter = detectDelimiter(lines[0] ?? "");
    const rows = lines.map((line) => parseDelimitedLine(line, delimiter));
    const rawHeaders = rows[0] ?? [];
    const headers = rawHeaders.map(toCanonicalHeader);
    const detectedColumns = [...new Set(headers.filter((header): header is SupportedColumn => SUPPORTED_COLUMNS.includes(header as SupportedColumn)))];

    const rejectedRowIndexes: number[] = [];
    const queueItems: IngestionQueuePayload[] = [];

    rows.slice(1).forEach((row, idx) => {
      const hasFormula = row.some((cell) => FORMULA_PREFIX_RE.test(cell));
      if (hasFormula) {
        rejectedRowIndexes.push(idx + 1);
        return;
      }
      const entry = Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]));
      const affiliateUrl = firstNonEmpty(entry.affiliate_url);
      const productUrl = firstNonEmpty(entry.product_url);
      if (!affiliateUrl || !productUrl) {
        rejectedRowIndexes.push(idx + 1);
        return;
      }
      queueItems.push(
        this.validateManualDraft(
          {
            affiliateUrl,
            productUrl,
            title: firstNonEmpty(entry.title, entry.shop_name) || undefined,
            campaignNote: buildCampaignNote(entry),
            price: toNumber(entry.price),
          },
          "csv"
        )
      );
    });

    return {
      headers,
      detectedColumns,
      rowCount: rows.length - 1,
      previewRows: rows.slice(1, 6),
      rejectedRowIndexes,
      queueItems,
    };
  }

  async persistCsvPreview(userId: string, csv: string) {
    const preview = this.previewCsv(csv);
    const created = await Promise.all(preview.queueItems.map((item, index) => this.createPending(userId, {
      affiliateUrl: item.payload.affiliateUrl,
      productUrl: item.payload.productUrl,
      title: item.payload.title,
      campaignNote: item.payload.campaignNote,
      price: item.payload.price,
      rowIndex: index + 1,
      source: "csv",
    })));
    return { preview, created };
  }
}

export { SP_PRODUCT_FEED_ALL_GLOBAL_CATEGORY_FILENAME };
export const shopeeAffiliateIngestionService = new ShopeeAffiliateIngestionService();
