#!/usr/bin/env tsx
import { readFileSync, statSync } from "node:fs";
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
};

type ProductCsvRow = {
  affiliateUrl: string;
  productUrl: string;
  title: string;
  price: number;
  category?: string;
  shopName?: string;
  campaignNote?: string;
  sourceRowNumber: number;
};

const DEFAULT_MAX_ROWS = 10_000;
const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;
const FORMULA_PREFIX_RE = /^[\t\r\s]*[=+\-@]/;

const HEADER_MAP = new Map<string, string>([
  ["ชื่อข้อเสนอ", "title"],
  ["ชื่อสินค้า", "title"],
  ["ชื่อร้านค้า", "shop_name"],
  ["ลิงก์ข้อเสนอ", "product_url"],
  ["ลิงก์สินค้า", "product_url"],
  ["ลิงก์ร้านค้า", "product_url"],
  ["ลิงก์สินค้า(สั้น)", "affiliate_url"],
  ["ลิงก์ร้านค้า(สั้น)", "affiliate_url"],
  ["ลิงก์สั้น", "affiliate_url"],
  ["อัตราค่าคอมมิชชัน", "campaign"],
  ["ค่าคอมมิชชัน", "campaign"],
  ["หมวดหมู่", "category"],
  ["หมวดหมู่สากล", "category"],
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
  ["product url", "product_url"],
  ["product_url", "product_url"],
  ["product link", "product_url"],
  ["product_link", "product_url"],
  ["offer url", "product_url"],
  ["offer_url", "product_url"],
  ["offer link", "product_url"],
  ["offer_link", "product_url"],
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
  ["commission", "campaign"],
  ["commission rate", "campaign"],
  ["commission_rate", "campaign"],
  ["commission %", "campaign"],
  ["payout", "campaign"],
  ["campaign", "campaign"],
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
  npm run db:import-csv-products -- --file ./SP-Product-Feed-All-Global-Category.csv --user-email user@example.com --apply

Required:
  --file, -f <path>       CSV/TSV file path.
  --user-email <email>    Product owner email, or use --user-id.
  --user-id <id>          Product owner id, or use --user-email.

Options:
  --delimiter <value>     auto | comma | tab. Default: auto.
  --platform <value>      FACEBOOK | INSTAGRAM | THREADS | X. Default: FACEBOOK.
  --apply                 Execute import. Without this flag, dry-run only.
  --max-rows <number>     Max data rows. Default: ${DEFAULT_MAX_ROWS}.
  --max-bytes <number>    Max file size bytes. Default: ${DEFAULT_MAX_BYTES}.
  --help                  Show this help.

Notes:
  - Imports into Product and AffiliateLink, not a staging table.
  - Upserts Product by unique (userId, originalUrl).
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

function detectDelimiter(text: string): string {
  let commaCount = 0;
  let tabCount = 0;
  let inQuotes = false;
  for (let i = 0; i < Math.min(text.length, 8192); i += 1) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') i += 1;
      else inQuotes = !inQuotes;
    } else if (!inQuotes && (c === "\n" || c === "\r")) {
      break;
    } else if (!inQuotes && c === ",") {
      commaCount += 1;
    } else if (!inQuotes && c === "\t") {
      tabCount += 1;
    }
  }
  return tabCount > commaCount ? "\t" : ",";
}

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && c === delimiter) {
      row.push(current.trim());
      current = "";
    } else if (!inQuotes && (c === "\n" || c === "\r")) {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(current.trim());
      current = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
    } else {
      current += c;
    }
  }

  row.push(current.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
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
    firstNonEmpty(row.category) ? `หมวดหมู่: ${firstNonEmpty(row.category)}` : undefined,
    firstNonEmpty(row.shop_name) ? `ร้านค้า: ${firstNonEmpty(row.shop_name)}` : undefined,
  ].filter((value): value is string => Boolean(value));
  return parts.length ? parts.join(" · ") : undefined;
}

function toProductRows(headers: string[], rawRows: string[][]): { rows: ProductCsvRow[]; rejected: Array<{ sourceRowNumber: number; reason: string }> } {
  const rows: ProductCsvRow[] = [];
  const rejected: Array<{ sourceRowNumber: number; reason: string }> = [];

  rawRows.forEach((rawRow, index) => {
    const sourceRowNumber = index + 2;
    if (rawRow.some((cell) => FORMULA_PREFIX_RE.test(cell))) {
      rejected.push({ sourceRowNumber, reason: "CSV_FORMULA_INJECTION" });
      return;
    }

    const row = Object.fromEntries(headers.map((header, columnIndex) => [header, rawRow[columnIndex] ?? ""]));
    const productUrl = firstNonEmpty(row.product_url, row.origin_link, row.landing_page_url);
    const affiliateUrl = firstNonEmpty(row.affiliate_url);

    if (!productUrl || !affiliateUrl) {
      rejected.push({ sourceRowNumber, reason: "MISSING_PRODUCT_OR_AFFILIATE_URL" });
      return;
    }

    if (!isAllowedShopeeAffiliateUrl(productUrl) || !isAllowedShopeeAffiliateUrl(affiliateUrl)) {
      rejected.push({ sourceRowNumber, reason: "URL_NOT_ALLOWED" });
      return;
    }

    rows.push({
      affiliateUrl,
      productUrl,
      title: firstNonEmpty(row.title, row.shop_name) ?? "Shopee Product Feed Import",
      price: parsePrice(firstNonEmpty(row.price, row.sale_price)),
      category: firstNonEmpty(row.category, row.global_category, row.main_category),
      shopName: firstNonEmpty(row.shop_name, row.seller_name),
      campaignNote: buildCampaignNote(row),
      sourceRowNumber,
    });
  });

  return { rows, rejected };
}

async function resolveUserId(prisma: PrismaClient, options: Options): Promise<string> {
  if (options.userId) return options.userId;
  const user = await prisma.user.findUnique({ where: { email: options.userEmail } });
  if (!user) throw new Error(`USER_NOT_FOUND: ${options.userEmail}`);
  return user.id;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const absoluteFile = path.resolve(options.file);
  const stats = statSync(absoluteFile);
  if (!stats.isFile()) throw new Error(`Not a file: ${absoluteFile}`);
  if (stats.size > options.maxBytes) throw new Error(`CSV_FILE_TOO_LARGE: ${stats.size} > ${options.maxBytes}`);

  const text = readFileSync(absoluteFile, "utf8");
  const delimiter = options.delimiter === "tab" ? "\t" : options.delimiter === "comma" ? "," : detectDelimiter(text);
  const records = parseDelimited(text, delimiter);
  if (records.length === 0) throw new Error("EMPTY_CSV");

  const [rawHeaders, ...rawRows] = records;
  if (!rawHeaders?.length) throw new Error("CSV_MISSING_HEADER");
  if (rawRows.length > options.maxRows) throw new Error(`CSV_ROW_LIMIT_EXCEEDED: ${rawRows.length} > ${options.maxRows}`);

  const headers = rawHeaders.map(normalizeHeader);
  const { rows, rejected } = toProductRows(headers, rawRows);

  console.log(JSON.stringify({
    file: absoluteFile,
    userEmail: options.userEmail,
    userId: options.userId,
    delimiter: delimiter === "\t" ? "tab" : "comma",
    inputRows: rawRows.length,
    importableRows: rows.length,
    rejectedRows: rejected.length,
    sampleRejected: rejected.slice(0, 10),
    dryRun: !options.apply,
  }, null, 2));

  if (!options.apply) {
    console.log("Dry run only. Re-run with --apply to import into Product and AffiliateLink.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    const userId = await resolveUserId(prisma, options);
    let productsUpserted = 0;
    let affiliateLinksUpserted = 0;

    for (const row of rows) {
      const product = await prisma.product.upsert({
        where: { userId_originalUrl: { userId, originalUrl: row.productUrl } },
        update: {
          title: row.title,
          price: new Prisma.Decimal(row.price),
          affiliateUrl: row.affiliateUrl,
          shopName: row.shopName,
          category: row.category,
          rawMetadata: {
            source: "csv_product_import",
            sourceFile: path.basename(absoluteFile),
            sourceRowNumber: row.sourceRowNumber,
            campaignNote: row.campaignNote,
          },
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
          rawMetadata: {
            source: "csv_product_import",
            sourceFile: path.basename(absoluteFile),
            sourceRowNumber: row.sourceRowNumber,
            campaignNote: row.campaignNote,
          },
        },
      });
      productsUpserted += 1;

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
      affiliateLinksUpserted += 1;
    }

    console.log(JSON.stringify({ ok: true, productsUpserted, affiliateLinksUpserted, rejectedRows: rejected.length }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});
