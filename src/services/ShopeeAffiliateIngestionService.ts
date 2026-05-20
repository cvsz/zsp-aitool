import { isAllowedShopeeAffiliateUrl } from "@/lib/shopee-affiliate-url-safety";

export type ShopeeAffiliateIngestionSource = "manual" | "csv" | "extension" | "open_api_future";
export type ShopeeAffiliateQueueStatus = "pending_review" | "approved" | "rejected" | "imported" | "failed";

export interface AffiliateDraftRecord {
  affiliateUrl: string;
  productUrl: string;
  title?: string;
  campaignNote?: string;
  price?: number;
  source: ShopeeAffiliateIngestionSource;
}

export interface IngestionQueuePayload {
  source: ShopeeAffiliateIngestionSource;
  status: ShopeeAffiliateQueueStatus;
  payload: AffiliateDraftRecord;
  errorSummary: string | null;
}

const FORMULA_PREFIX_RE = /^[\t\r\s]*[=+\-@]/;
const MAX_CSV_ROWS = 1_000;
const MAX_CSV_BYTES = 1_000_000;

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

export class ShopeeAffiliateIngestionService {
  validateManualDraft(input: Omit<AffiliateDraftRecord, "source">, source: ShopeeAffiliateIngestionSource = "manual"): IngestionQueuePayload {
    if (!isAllowedShopeeAffiliateUrl(input.affiliateUrl) || !isAllowedShopeeAffiliateUrl(input.productUrl)) {
      return { source, status: "rejected", payload: { ...input, source }, errorSummary: "URL ต้องเป็น Shopee HTTPS ที่อยู่ใน allowlist เท่านั้น" };
    }

    return { source, status: "pending_review", payload: { ...input, source }, errorSummary: null };
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
            price: entry.price ? Number(entry.price) : undefined,
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
}

export const shopeeAffiliateIngestionService = new ShopeeAffiliateIngestionService();
