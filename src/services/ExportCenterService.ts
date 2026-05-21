import { ContentGeneration, Prisma, ShopeeAffiliateSocialDraft } from "@prisma/client";

import { type CsvValue, toCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

type ExportDataset = "products" | "affiliate-links" | "social-drafts" | "content-history";
type ExportFormat = "csv" | "json" | "md" | "txt";

const ALLOWED_FORMATS: Record<ExportDataset, ExportFormat[]> = {
  products: ["csv", "json", "md", "txt"],
  "affiliate-links": ["csv", "json", "md", "txt"],
  "social-drafts": ["csv", "json", "md", "txt"],
  "content-history": ["csv", "json", "md", "txt"],
};

const SYNC_LIMIT = 500;

export interface ExportCenterFilterInput {
  format?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  shopName?: string;
  platform?: string;
  status?: string;
  q?: string;
  hasAffiliateUrl?: string;
  includeArchived?: string;
}

export interface ExportResult {
  body: string;
  contentType: string;
  filename: string;
  rowCount: number;
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function parseBool(v?: string): boolean {
  return v === "true";
}

function escapeMd(value: unknown): string {
  return String(value ?? "-").replace(/\n/g, " ");
}

function contentTypeFor(format: ExportFormat): string {
  if (format === "csv") return "text/csv; charset=utf-8";
  if (format === "json") return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

function normalizeFormat(dataset: ExportDataset, format?: string): ExportFormat {
  const normalized = (format ?? "csv") as ExportFormat;
  if (!ALLOWED_FORMATS[dataset].includes(normalized)) throw new Error("unsupported_format");
  return normalized;
}

export class ExportCenterService {
  buildProductWhere(userId: string, filters: ExportCenterFilterInput): Prisma.ProductWhereInput {
    const includeArchived = parseBool(filters.includeArchived);
    return {
      userId,
      deletedAt: includeArchived ? undefined : null,
      category: filters.category || undefined,
      shopName: filters.shopName || undefined,
      affiliateUrl: filters.hasAffiliateUrl === "true" ? { not: null } : undefined,
      createdAt: { gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined, lte: filters.dateTo ? new Date(filters.dateTo) : undefined },
      OR: filters.q
        ? [
            { title: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
          ]
        : undefined,
    };
  }

  async exportProducts(userId: string, filters: ExportCenterFilterInput): Promise<ExportResult> {
    const format = normalizeFormat("products", filters.format);
    const where = this.buildProductWhere(userId, filters);
    const rows = await prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take: SYNC_LIMIT });
    return this.formatExport("products", format, rows.map((row) => ({ id: row.id, title: row.title, price: String(row.price), currency: row.currency, shopName: row.shopName, category: row.category, affiliateUrl: row.affiliateUrl, createdAt: row.createdAt.toISOString() })));
  }

  async exportAffiliateLinks(userId: string, filters: ExportCenterFilterInput): Promise<ExportResult> {
    const format = normalizeFormat("affiliate-links", filters.format);
    const includeArchived = parseBool(filters.includeArchived);
    const rows = await prisma.affiliateLink.findMany({
      where: {
        userId,
        deletedAt: includeArchived ? undefined : null,
        platform: filters.platform as Prisma.EnumPlatformFilter | undefined,
        createdAt: { gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined, lte: filters.dateTo ? new Date(filters.dateTo) : undefined },
      },
      orderBy: { createdAt: "desc" },
      take: SYNC_LIMIT,
    });

    return this.formatExport("affiliate-links", format, rows.map((r) => ({ id: r.id, platform: r.platform, originalUrl: r.originalUrl, affiliateUrl: r.affiliateUrl, trackingCode: r.trackingCode, clickCount: r.clickCount, createdAt: r.createdAt.toISOString() })));
  }

  async exportSocialDrafts(userId: string, filters: ExportCenterFilterInput): Promise<ExportResult> {
    const format = normalizeFormat("social-drafts", filters.format);
    const includeArchived = parseBool(filters.includeArchived);
    const rows = await prisma.shopeeAffiliateSocialDraft.findMany({
      where: {
        userId,
        deletedAt: includeArchived ? undefined : null,
        status: filters.status as ShopeeAffiliateSocialDraft["status"] | undefined,
        channel: filters.platform as ShopeeAffiliateSocialDraft["channel"] | undefined,
        createdAt: { gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined, lte: filters.dateTo ? new Date(filters.dateTo) : undefined },
      },
      orderBy: { createdAt: "desc" },
      take: SYNC_LIMIT,
    });

    return this.formatExport("social-drafts", format, rows.map((r) => ({ id: r.id, channel: r.channel, status: r.status, title: r.title, content: r.content, disclosure: r.disclosure, hashtags: r.hashtags, createdAt: r.createdAt.toISOString() })));
  }

  async exportContentHistory(userId: string, filters: ExportCenterFilterInput): Promise<ExportResult> {
    const format = normalizeFormat("content-history", filters.format);
    const includeArchived = parseBool(filters.includeArchived);
    const rows = await prisma.contentGeneration.findMany({
      where: {
        userId,
        deletedAt: includeArchived ? undefined : null,
        platform: filters.platform as ContentGeneration["platform"] | undefined,
        status: filters.status as ContentGeneration["status"] | undefined,
        createdAt: { gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined, lte: filters.dateTo ? new Date(filters.dateTo) : undefined },
      },
      orderBy: { createdAt: "desc" },
      take: SYNC_LIMIT,
    });

    return this.formatExport("content-history", format, rows.map((r) => ({ id: r.id, platform: r.platform, tone: r.tone, language: r.language, status: r.status, output: JSON.stringify(r.output), createdAt: r.createdAt.toISOString() })));
  }

  private formatExport(dataset: ExportDataset, format: ExportFormat, rows: Record<string, CsvValue>[]): ExportResult {
    const filename = safeFileName(`${dataset}-${new Date().toISOString().slice(0, 10)}.${format}`);
    if (format === "json") return { body: JSON.stringify(rows, null, 2), contentType: contentTypeFor(format), filename, rowCount: rows.length };
    if (format === "csv") return { body: toCsv(rows, Object.keys(rows[0] ?? {})), contentType: contentTypeFor(format), filename, rowCount: rows.length };
    const body = rows
      .map((row) => Object.entries(row).map(([k, v]) => `${k}: ${escapeMd(v)}`).join(format === "md" ? " | " : "\n"))
      .join(format === "md" ? "\n\n" : "\n\n---\n\n");
    return { body, contentType: contentTypeFor(format), filename, rowCount: rows.length };
  }
}
