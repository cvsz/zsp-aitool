#!/usr/bin/env tsx
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

type DelimiterOption = "auto" | "comma" | "tab";
type ColumnType = "TEXT" | "BOOLEAN" | "BIGINT" | "NUMERIC";

type Options = {
  file: string;
  table: string;
  schema: string;
  delimiter: DelimiterOption;
  apply: boolean;
  dropExisting: boolean;
  truncate: boolean;
  inferTypes: boolean;
  maxRows: number;
  maxBytes: number;
};

const DEFAULT_MAX_ROWS = 10_000;
const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;

const COMMON_HEADER_MAP = new Map<string, string>([
  ["ชื่อข้อเสนอ", "title"],
  ["ชื่อสินค้า", "title"],
  ["ชื่อร้านค้า", "shop_name"],
  ["ลิงก์ข้อเสนอ", "product_url"],
  ["ลิงก์สินค้า", "product_url"],
  ["ลิงก์ร้านค้า", "product_url"],
  ["ลิงก์สินค้า(สั้น)", "affiliate_url"],
  ["ลิงก์ร้านค้า(สั้น)", "affiliate_url"],
  ["ลิงก์สั้น", "affiliate_url"],
  ["อัตราค่าคอมมิชชัน", "commission_rate"],
  ["ค่าคอมมิชชัน", "commission"],
  ["หมวดหมู่", "category"],
  ["หมวดหมู่สากล", "global_category"],
  ["affiliate url", "affiliate_url"],
  ["affiliate link", "affiliate_url"],
  ["tracking link", "affiliate_url"],
  ["deeplink", "affiliate_url"],
  ["short link", "affiliate_url"],
  ["product url", "product_url"],
  ["product link", "product_url"],
  ["offer url", "product_url"],
  ["offer link", "product_url"],
  ["shop url", "shop_url"],
  ["shop link", "shop_url"],
  ["landing page", "landing_page_url"],
  ["landing page url", "landing_page_url"],
  ["origin link", "origin_link"],
  ["offer name", "title"],
  ["product name", "title"],
  ["item name", "title"],
  ["name", "title"],
  ["title", "title"],
  ["shop name", "shop_name"],
  ["seller name", "seller_name"],
  ["commission", "commission"],
  ["commission rate", "commission_rate"],
  ["payout", "payout"],
  ["campaign", "campaign"],
  ["global category", "global_category"],
  ["all global category", "global_category"],
  ["category", "category"],
  ["category name", "category"],
  ["main category", "main_category"],
  ["price", "price"],
  ["sale price", "sale_price"],
]);

function printHelp() {
  console.log(`Safe CSV/TSV to PostgreSQL table importer

Usage:
  npx tsx scripts/db/import-csv-to-table.ts --file ./data.csv --table staging_table --apply

Options:
  --file, -f <path>       CSV/TSV file path. Required.
  --table, -t <name>      Destination table. Defaults to sanitized file basename.
  --schema <name>         Destination schema. Default: public.
  --delimiter <value>     auto | comma | tab. Default: auto.
  --apply                 Execute SQL. Without this flag, dry-run only.
  --drop-existing         Drop destination table before create. Requires --apply.
  --truncate              Truncate table before insert. Requires --apply.
  --infer-types           Infer BOOLEAN/BIGINT/NUMERIC. Default stores CSV columns as TEXT.
  --max-rows <number>     Max data rows. Default: ${DEFAULT_MAX_ROWS}.
  --max-bytes <number>    Max file size bytes. Default: ${DEFAULT_MAX_BYTES}.
  --help                  Show this help.

Examples:
  npx tsx scripts/db/import-csv-to-table.ts \
    --file ./SP-Product-Feed-All-Global-Category.csv \
    --table sp_product_feed_all_global_category \
    --apply

  npx tsx scripts/db/import-csv-to-table.ts \
    --file ./report.tsv --delimiter tab --table report_staging --apply --truncate
`);
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    file: "",
    table: "",
    schema: "public",
    delimiter: "auto",
    apply: false,
    dropExisting: false,
    truncate: false,
    inferTypes: false,
    maxRows: DEFAULT_MAX_ROWS,
    maxBytes: DEFAULT_MAX_BYTES,
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
      case "--table":
      case "-t":
        options.table = requireValue(arg, next);
        i += 1;
        break;
      case "--schema":
        options.schema = requireValue(arg, next);
        i += 1;
        break;
      case "--delimiter": {
        const value = requireValue(arg, next) as DelimiterOption;
        if (!["auto", "comma", "tab"].includes(value)) throw new Error("--delimiter must be auto, comma, or tab");
        options.delimiter = value;
        i += 1;
        break;
      }
      case "--apply":
        options.apply = true;
        break;
      case "--drop-existing":
        options.dropExisting = true;
        break;
      case "--truncate":
        options.truncate = true;
        break;
      case "--infer-types":
        options.inferTypes = true;
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
  if (!options.table) options.table = tableNameFromFile(options.file);
  options.schema = sanitizeIdentifier(options.schema, "schema");
  options.table = sanitizeIdentifier(options.table, "table");
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

function tableNameFromFile(filePath: string): string {
  return sanitizeIdentifier(path.basename(filePath).replace(/\.[^.]+$/, ""), "table");
}

function sanitizeIdentifier(input: string, fallbackPrefix: string): string {
  const normalized = input
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  const base = normalized.length > 0 ? normalized : fallbackPrefix;
  const prefixed = /^[a-z_]/.test(base) ? base : `${fallbackPrefix}_${base}`;
  return prefixed.slice(0, 63);
}

function normalizeHeader(header: string, index: number): string {
  const trimmed = header.trim().replace(/^\uFEFF/, "").replace(/^"|"$/g, "").trim();
  const mapped = COMMON_HEADER_MAP.get(trimmed) ?? COMMON_HEADER_MAP.get(trimmed.toLowerCase()) ?? trimmed;
  return sanitizeIdentifier(mapped || `column_${index + 1}`, `column_${index + 1}`);
}

function dedupeColumns(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((header, index) => {
    const base = normalizeHeader(header, index);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`.slice(0, 63);
  });
}

function detectDelimiter(text: string): string {
  let commaCount = 0;
  let tabCount = 0;
  let inQuotes = false;

  for (let i = 0; i < Math.min(text.length, 8192); i += 1) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
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

function inferColumnType(values: string[]): ColumnType {
  const nonEmpty = values.map((value) => value.trim()).filter(Boolean);
  if (nonEmpty.length === 0) return "TEXT";
  if (nonEmpty.every((value) => /^(true|false)$/i.test(value))) return "BOOLEAN";
  if (nonEmpty.every((value) => /^-?(0|[1-9]\d*)$/.test(value))) return "BIGINT";
  if (nonEmpty.every((value) => /^-?(0|[1-9]\d*)(\.\d+)?$/.test(value))) return "NUMERIC";
  return "TEXT";
}

function quoteIdent(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function tableRef(schema: string, table: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(table)}`;
}

function buildCreateSql(options: Options, columns: string[], columnTypes: ColumnType[]): string {
  const csvColumns = columns.map((column, index) => `  ${quoteIdent(column)} ${columnTypes[index]} NULL`).join(",\n");
  return [
    `CREATE SCHEMA IF NOT EXISTS ${quoteIdent(options.schema)};`,
    options.dropExisting ? `DROP TABLE IF EXISTS ${tableRef(options.schema, options.table)};` : "",
    `CREATE TABLE IF NOT EXISTS ${tableRef(options.schema, options.table)} (`,
    "  id BIGSERIAL PRIMARY KEY,",
    "  source_file TEXT NOT NULL,",
    "  source_row_number INTEGER NOT NULL,",
    csvColumns ? `${csvColumns},` : "",
    "  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()",
    ");",
    options.truncate ? `TRUNCATE TABLE ${tableRef(options.schema, options.table)};` : "",
  ].filter(Boolean).join("\n");
}

function coerceValue(value: string, type: ColumnType): unknown {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (type === "BOOLEAN") return /^true$/i.test(trimmed);
  if (type === "BIGINT") return BigInt(trimmed);
  if (type === "NUMERIC") return trimmed;
  return value;
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

  const columns = dedupeColumns(rawHeaders);
  const rows = rawRows.map((row) => columns.map((_, index) => row[index] ?? ""));
  const columnTypes = columns.map((_, index) => options.inferTypes ? inferColumnType(rows.map((row) => row[index] ?? "")) : "TEXT");
  const createSql = buildCreateSql(options, columns, columnTypes);

  console.log(JSON.stringify({
    file: absoluteFile,
    schema: options.schema,
    table: options.table,
    delimiter: delimiter === "\t" ? "tab" : "comma",
    rows: rows.length,
    columns: columns.map((name, index) => ({ name, type: columnTypes[index], original: rawHeaders[index] ?? "" })),
    dryRun: !options.apply,
  }, null, 2));

  if (!options.apply) {
    console.log("\n-- DRY RUN SQL --");
    console.log(createSql);
    console.log("\nRe-run with --apply to create table and insert rows.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(createSql);
    const insertColumns = ["source_file", "source_row_number", ...columns];
    const quotedInsertColumns = insertColumns.map(quoteIdent).join(", ");
    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(", ");
    const insertSql = `INSERT INTO ${tableRef(options.schema, options.table)} (${quotedInsertColumns}) VALUES (${placeholders})`;

    let inserted = 0;
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      const values = [
        path.basename(absoluteFile),
        rowIndex + 2,
        ...row.map((value, columnIndex) => coerceValue(value, columnTypes[columnIndex])),
      ];
      await prisma.$executeRawUnsafe(insertSql, ...values);
      inserted += 1;
    }

    console.log(JSON.stringify({ ok: true, inserted, table: `${options.schema}.${options.table}` }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});
