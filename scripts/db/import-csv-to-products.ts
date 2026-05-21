#!/usr/bin/env tsx
import { createReadStream, statSync } from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { Platform, Prisma, PrismaClient } from "@prisma/client";
import { isAllowedShopeeAffiliateUrl } from "../../src/lib/shopee-affiliate-url-safety";

type DelimiterOption = "auto" | "comma" | "tab";

type Options = {
  file: string;
  userId?: string;
  userEmail?: string;
  delimiter: DelimiterOption;
  apply: boolean;
  maxRows: number;
  maxBytes: number;
  platform: Platform;
  reportEvery: number;
};

type ProductCsvRow = {
  affiliateUrl: string;
  productUrl: string;
  title: string;
  price: number;
  category?: string;
  shopName?: string;
  campaignNote?: string;
  productIdRaw?: string;
  soldCountRaw?: string;
  commissionRate?: string;
  commissionAmount?: string;
  sourceRowNumber: number;
};

type ImportStats = {
  inputRows: number;
  importableRows: number;
  rejectedRows: number;
  productsUpserted: number;
  affiliateLinksUpserted: number;
  sampleRejected: Array<{ sourceRowNumber: number; reason: string }>;
};

type UserIdRow = { id: string };

const DEFAULT_MAX_ROWS = 5_000_000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024 * 1024;
const DEFAULT_REPORT_EVERY = 1_000;
const FORMULA_PREFIX_RE = /^[\t\r\s]*[=+\-@]/;

const HEADER_MAP = new Map<string, string>([
  ["รหัสสินค้า", "product_id"],
  ["ชื่อข้อเสนอ", "title"],
  ["ชื่อสินค้า", "title"],
  ["ราคา", "price"],
  ["ขาย", "sold_count"],
  ["ชื่อร้านค้า", "shop_name"],
  ["ลิงก์ข้อเสนอ", "affiliate_url"],
  ["ลิงก์สินค้า", "product_url"],
  ["ลิงก์ร้านค้า", "product_url"],
  ["ลิงก์สินค้า(สั้น)", "affiliate_url"],
  ["ลิงก์ร้านค้า(สั้น)", "affiliate_url"],
  ["ลิงก์สั้น", "affiliate_url"],
  ["อัตราค่าคอมมิชชัน", "commission_rate"],
  ["ค่าคอมมิชชัน", "commission_amount"],
  ["คอมมิชชัน", "commission_amount"],
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
  ["landing page", "product_url"],
  ["landing page url", "product_url"],
  ["landing_page_url", "product_url"],
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
  ["price", "price"],
  ["sale price", "price"],
  ["sale_price", "price"],
]);

function printHelp() {
  console.log(`Import a CSV/TSV file into the main zsp-aitool Product list.

Usage:
  npm run db:import-csv-products -- --file ./100ProductSet1.csv --user-email user@example.com --apply

Required:
  --file, -f <path>       CSV/TSV file path.
  --user-email <email>    Product owner email, or use --user-id.
  --user-id <id>          Product owner id, or use --user-email.

Options:
  --delimiter <value>     auto | comma | tab. Default: auto.
  --platform <value>      FACEBOOK | INSTAGRAM | THREADS | X. Default: FACEBOOK.
  --apply                 Execute import. Without this flag, dry-run only.
  --max-rows <number>     Max data rows to scan/import. Default: ${DEFAULT_MAX_ROWS}.
  --max-bytes <number>    Max file size bytes. Default: ${DEFAULT_MAX_BYTES}.
  --report-every <number> Progress interval. Default: ${DEFAULT_REPORT_EVERY}.
  --help                  Show this help.

Notes:
  - Streams large files; it does not read the full CSV into memory.
  - Imports into Product and AffiliateLink, not a staging table.
  - Upserts Product by unique (userId, originalUrl).
  - Supports uploaded Shopee CSV headers: รหัสสินค้า, ชื่อสินค้า, ราคา, ขาย, ชื่อร้านค้า, อัตราค่าคอมมิชชัน, คอมมิชชัน, ลิงก์สินค้า, ลิงก์ข้อเสนอ.
  - Treats ลิงก์สินค้า as Product.originalUrl and ลิงก์ข้อเสนอ as Product.affiliateUrl / AffiliateLink.affiliateUrl.
  - Rejects formula-injection rows.
  - Rejects rows without product_url or affiliate_url.
  - URL values must pass the existing Shopee HTTPS allowlist.
`);
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    file: "",
    delimiter: "auto",
    apply: false,
    maxRows: DEFAULT_MAX_ROWS,
    maxBytes: DEFAULT_MAX_BYTES,
    platform: Platform.FACEBOOK,
    reportEvery: DEFAULT_REPORT_EVERY,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      case "--file":
      case "-f":
        options.file = requireValue(arg, next);
        i += 1;
        break;
      case "--user-id":
        options.userId = requireValue(arg, next);
        i += 1;
        break;
      case "--user-email":
        options.userEmail = requireValue(arg, next).toLowerCase();
        i += 1;
        break;
      case "--delimiter": {
        const value = requireValue(arg, next) as DelimiterOption;
        if (!["auto", "comma", "tab"].includes(value)) throw new Error("--delimiter must be auto, comma, or tab");
        options.delimiter = value;
        i += 1;
        break;
      }
      case "--platform": {
        const value = requireValue(arg, next).toUpperCase();
        if (!Object.values(Platform).includes(value as Platform)) throw new Error("--platform must be FACEBOOK, INSTAGRAM, THREADS, or X");
        options.platform = value as Platform;
        i += 1;
        break;
      }
      case "--apply":
        options.apply = true;
        break;
      case "--max-rows":
        options.maxRows = parsePositiveInteger(arg, requireValue(arg, next));
        i += 1;
        break;
      case "--max-bytes":
        options.maxBytes = parsePositiveInteger(arg, requireValue(arg, next));
        i += 1;
        break;
      case "--report-every":
        options.reportEvery = parsePositiveInteger(arg, requireValue(arg, next));
        i += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.file) throw new Error("--file is required");
  if (!options.userId && !options.userEmail) throw new Error("--user-email or --user-id is required");
  return options;
}

function requireValue(flag: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function parsePositiveInteger(flag: string, value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${flag} must be a positive integer`);
  return parsed;
}

function normalizeHeader(header: string): string {
  const trimmed = header.trim().replace(/^\uFEFF/, "").replace(/^"|"$/g, "").trim();
  const mapped = HEADER_MAP.get(trimmed) ?? HEADER_MAP.get(trimmed.toLowerCase()) ?? trimmed;
  return mapped.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
}

function detectDelimiterFromHeader(line: string): string {
  let commaCount = 0;
  let tabCount = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') i += 1;
      else inQuotes = !inQuotes;
    } else if (!inQuotes && c === ",") {
      commaCount += 1;
    } else if (!inQuotes && c === "\t") {
      tabCount += 1;
    }
  }
  return tabCount > commaCount ? "\t" : ",";
}

function parseDelimitedLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && c === delimiter) {
      out.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }

  out.push(current.trim());
  return out;
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

function parsePrice(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/,/g, "").replace(/[฿\s]/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function buildCampaignNote(row: Record<string, string>): string | undefined {
  const parts = [
    firstNonEmpty(row.campaign),
    firstNonEmpty(row.commission_rate) ? `อัตราค่าคอมมิชชัน: ${firstNonEmpty(row.commission_rate)}` : undefined,
    firstNonEmpty(row.commission_amount) ? `คอมมิชชัน: ${firstNonEmpty(row.commission_amount)}` : undefined,
    firstNonEmpty(row.sold_count) ? `ขาย: ${firstNonEmpty(row.sold_count)}` : undefined,
    firstNonEmpty(row.category) ? `หมวดหมู่: ${firstNonEmpty(row.category)}` : undefined,
    firstNonEmpty(row.shop_name) ? `ร้านค้า: ${firstNonEmpty(row.shop_name)}` : undefined,
  ].filter((value): value is string => Boolean(value));
  return parts.length ? parts.join(" · ") : undefined;
}

function toProductRow(headers: string[], rawRow: string[], sourceRowNumber: number): { row?: ProductCsvRow; rejected?: { sourceRowNumber: number; reason: string } } {
  if (rawRow.some((cell) => FORMULA_PREFIX_RE.test(cell))) {
    return { rejected: { sourceRowNumber, reason: "CSV_FORMULA_INJECTION" } };
  }

  const row = Object.fromEntries(headers.map((header, columnIndex) => [header, rawRow[columnIndex] ?? ""]));
  const productUrl = firstNonEmpty(row.product_url, row.shop_url, row.origin_link, row.landing_page_url);
  const affiliateUrl = firstNonEmpty(row.affiliate_url, row.short_link, row.offer_url);

  if (!productUrl || !affiliateUrl) {
    return { rejected: { sourceRowNumber, reason: "MISSING_PRODUCT_OR_AFFILIATE_URL" } };
  }

  if (!isAllowedShopeeAffiliateUrl(productUrl) || !isAllowedShopeeAffiliateUrl(affiliateUrl)) {
    return { rejected: { sourceRowNumber, reason: "URL_NOT_ALLOWED" } };
  }

  return {
    row: {
      affiliateUrl,
      productUrl,
      title: firstNonEmpty(row.title, row.shop_name) ?? "Shopee Product Feed Import",
      price: parsePrice(firstNonEmpty(row.price, row.sale_price)),
      category: firstNonEmpty(row.category, row.global_category, row.main_category),
      shopName: firstNonEmpty(row.shop_name, row.seller_name),
      campaignNote: buildCampaignNote(row),
      productIdRaw: firstNonEmpty(row.product_id),
      soldCountRaw: firstNonEmpty(row.sold_count),
      commissionRate: firstNonEmpty(row.commission_rate),
      commissionAmount: firstNonEmpty(row.commission_amount),
      sourceRowNumber,
    },
  };
}

async function resolveUserId(prisma: PrismaClient, options: Options): Promise<string> {
  if (options.userId) return options.userId;
  if (!options.userEmail) throw new Error("USER_EMAIL_REQUIRED");

  // Use a narrow raw query so this import utility still works when the production
  // User table has schema drift on unrelated columns such as planTier.
  const rows = await prisma.$queryRaw<UserIdRow[]>`
    SELECT id
    FROM "User"
    WHERE lower(email) = lower(${options.userEmail})
    LIMIT 1
  `;

  const userId = rows[0]?.id;
  if (!userId) throw new Error(`USER_NOT_FOUND: ${options.userEmail}`);
  return userId;
}

async function upsertProductRow(prisma: PrismaClient, userId: string, row: ProductCsvRow, options: Options, absoluteFile: string) {
  const rawMetadata = {
    source: "csv_product_import",
    sourceFile: path.basename(absoluteFile),
    sourceRowNumber: row.sourceRowNumber,
    productIdRaw: row.productIdRaw,
    soldCountRaw: row.soldCountRaw,
    commissionRate: row.commissionRate,
    commissionAmount: row.commissionAmount,
    campaignNote: row.campaignNote,
  };

  const product = await prisma.product.upsert({
    where: { userId_originalUrl: { userId, originalUrl: row.productUrl } },
    update: {
      title: row.title,
      price: new Prisma.Decimal(row.price),
      affiliateUrl: row.affiliateUrl,
      shopName: row.shopName,
      category: row.category,
      rawMetadata,
      deletedAt: null,
    },
    create: {
      userId,
      title: row.title,
      price: new Prisma.Decimal(row.price),
      currency: "THB",
      originalUrl: row.productUrl,
      affiliateUrl: row.affiliateUrl,
      shopName: row.shopName,
      category: row.category,
      rawMetadata,
    },
  });

  await prisma.affiliateLink.upsert({
    where: { id: `${product.id}-${options.platform}-csv-affiliate-link` },
    update: {
      originalUrl: row.productUrl,
      affiliateUrl: row.affiliateUrl,
      trackingCode: row.campaignNote,
      deletedAt: null,
    },
    create: {
      id: `${product.id}-${options.platform}-csv-affiliate-link`,
      userId,
      productId: product.id,
      platform: options.platform,
      originalUrl: row.productUrl,
      affiliateUrl: row.affiliateUrl,
      trackingCode: row.campaignNote,
    },
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const absoluteFile = path.resolve(options.file);
  const stats = statSync(absoluteFile);
  if (!stats.isFile()) throw new Error(`Not a file: ${absoluteFile}`);
  if (stats.size > options.maxBytes) throw new Error(`CSV_FILE_TOO_LARGE: ${stats.size} > ${options.maxBytes}`);

  const stream = createReadStream(absoluteFile, { encoding: "utf8" });
  const reader = readline.createInterface({ input: stream, crlfDelay: Infinity });
  const prisma = options.apply ? new PrismaClient() : undefined;

  let delimiter = options.delimiter === "tab" ? "\t" : options.delimiter === "comma" ? "," : "";
  let headers: string[] | null = null;
  let userId: string | null = null;
  const statsOut: ImportStats = { inputRows: 0, importableRows: 0, rejectedRows: 0, productsUpserted: 0, affiliateLinksUpserted: 0, sampleRejected: [] };

  try {
    if (options.apply && prisma) {
      userId = await resolveUserId(prisma, options);
    }

    console.log(JSON.stringify({
      file: absoluteFile,
      bytes: stats.size,
      userEmail: options.userEmail,
      userId: options.userId ?? userId,
      maxRows: options.maxRows,
      dryRun: !options.apply,
      streaming: true,
    }, null, 2));

    for await (const line of reader) {
      if (!line.trim()) continue;
      if (!headers) {
        delimiter ||= detectDelimiterFromHeader(line);
        headers = parseDelimitedLine(line, delimiter).map(normalizeHeader);
        console.log(JSON.stringify({ delimiter: delimiter === "\t" ? "tab" : "comma", headers }, null, 2));
        continue;
      }

      statsOut.inputRows += 1;
      if (statsOut.inputRows > options.maxRows) throw new Error(`CSV_ROW_LIMIT_EXCEEDED: ${statsOut.inputRows} > ${options.maxRows}`);

      const rawRow = parseDelimitedLine(line, delimiter);
      const parsed = toProductRow(headers, rawRow, statsOut.inputRows + 1);

      if (parsed.rejected) {
        statsOut.rejectedRows += 1;
        if (statsOut.sampleRejected.length < 10) statsOut.sampleRejected.push(parsed.rejected);
      } else if (parsed.row) {
        statsOut.importableRows += 1;
        if (options.apply && prisma && userId) {
          await upsertProductRow(prisma, userId, parsed.row, options, absoluteFile);
          statsOut.productsUpserted += 1;
          statsOut.affiliateLinksUpserted += 1;
        }
      }

      if (statsOut.inputRows % options.reportEvery === 0) {
        console.log(JSON.stringify({ progress: true, ...statsOut }));
      }
    }

    if (!headers) throw new Error("CSV_MISSING_HEADER");

    console.log(JSON.stringify({ ok: true, ...statsOut, dryRun: !options.apply }, null, 2));
    if (!options.apply) {
      console.log("Dry run only. Re-run with --apply to import into Product and AffiliateLink.");
    }
  } finally {
    await prisma?.$disconnect();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});
