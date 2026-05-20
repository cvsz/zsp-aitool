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

function parseCsvLine(line: string): string[] {
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
    } else if (c === "," && !inQuotes) {
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
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
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

    const rows = lines.map(parseCsvLine);
    const headers = (rows[0] ?? []).map((h) => h.toLowerCase());
    const supported = ["affiliate_url", "product_url", "title", "campaign", "source", "price"];
    const detectedColumns = headers.filter((h) => supported.includes(h));

    const rejectedRowIndexes: number[] = [];
    const queueItems: IngestionQueuePayload[] = [];

    rows.slice(1).forEach((row, idx) => {
      const hasFormula = row.some((cell) => FORMULA_PREFIX_RE.test(cell));
      if (hasFormula) {
        rejectedRowIndexes.push(idx + 1);
        return;
      }
      const entry = Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]));
      if (!entry.affiliate_url || !entry.product_url) {
        rejectedRowIndexes.push(idx + 1);
        return;
      }
      queueItems.push(
        this.validateManualDraft(
          {
            affiliateUrl: entry.affiliate_url,
            productUrl: entry.product_url,
            title: entry.title || undefined,
            campaignNote: entry.campaign || undefined,
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

export const shopeeAffiliateIngestionService = new ShopeeAffiliateIngestionService();
