import { AppError } from "@/lib/errors";

const MAX_TAGS = 30;
const MAX_TAG_LENGTH = 50;

export function sanitizeOptionalText(input: unknown, maxLength: number): string | undefined {
  if (typeof input !== "string") return undefined;
  const cleaned = input.replace(/\s+/g, " ").trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLength);
}

export function parsePriceSafely(input: unknown): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input) || input < 0) throw new AppError("VALIDATION_ERROR", "price must be a non-negative number", 422);
    return input;
  }
  if (typeof input === "string") {
    const normalized = input.replace(/[^\d.,-]/g, "").replace(/,/g, "");
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) throw new AppError("VALIDATION_ERROR", "price must be a non-negative number", 422);
    return parsed;
  }
  throw new AppError("VALIDATION_ERROR", "price is required", 422);
}

export function ensureHttpUrl(url: string, field = "url"): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new AppError("VALIDATION_ERROR", `${field} must be a valid URL`, 422);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError("VALIDATION_ERROR", `${field} must use HTTP/HTTPS`, 422);
  }
  return parsed.toString();
}

export function normalizeProductUrl(url: string): string {
  const parsed = new URL(ensureHttpUrl(url, "originalUrl"));
  parsed.hash = "";
  const removeParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
  removeParams.forEach((p) => parsed.searchParams.delete(p));
  const entries = Array.from(parsed.searchParams.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  parsed.search = "";
  entries.forEach(([k, v]) => parsed.searchParams.append(k, v));
  parsed.hostname = parsed.hostname.toLowerCase();
  if ((parsed.protocol === "https:" && parsed.port === "443") || (parsed.protocol === "http:" && parsed.port === "80")) parsed.port = "";
  if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  return parsed.toString();
}

export type ProductImportValidationInput = {
  title: unknown;
  originalUrl: unknown;
  price: unknown;
  imageUrls: unknown;
  rating?: unknown;
  reviewCount?: unknown;
  soldCount?: unknown;
  tags?: unknown;
};

export function validateAndNormalizeTags(input: unknown): string[] | undefined {
  if (input == null) return undefined;
  if (!Array.isArray(input)) throw new AppError("VALIDATION_ERROR", "tags must be an array", 422);
  const cleaned = input
    .map((value) => sanitizeOptionalText(value, MAX_TAG_LENGTH))
    .filter((value): value is string => Boolean(value));
  if (cleaned.length > MAX_TAGS) throw new AppError("VALIDATION_ERROR", `tags must not exceed ${MAX_TAGS} items`, 422);
  return Array.from(new Set(cleaned));
}

export function validateImportFields(input: ProductImportValidationInput): void {
  const title = sanitizeOptionalText(input.title, 300);
  if (!title) throw new AppError("VALIDATION_ERROR", "title is required", 422);

  if (typeof input.originalUrl !== "string" || !input.originalUrl.trim()) {
    throw new AppError("VALIDATION_ERROR", "originalUrl is required", 422);
  }
  normalizeProductUrl(input.originalUrl);
  parsePriceSafely(input.price);

  if (!Array.isArray(input.imageUrls)) throw new AppError("VALIDATION_ERROR", "imageUrls must be an array", 422);
  input.imageUrls.forEach((imageUrl) => ensureHttpUrl(String(imageUrl), "imageUrls"));

  if (input.rating != null) {
    if (typeof input.rating !== "number" || !Number.isFinite(input.rating) || input.rating < 0 || input.rating > 5) {
      throw new AppError("VALIDATION_ERROR", "rating must be between 0 and 5", 422);
    }
  }
  if (input.reviewCount != null) {
    if (typeof input.reviewCount !== "number" || !Number.isInteger(input.reviewCount) || input.reviewCount < 0) {
      throw new AppError("VALIDATION_ERROR", "reviewCount must be a non-negative integer", 422);
    }
  }
  if (input.soldCount != null) {
    if (typeof input.soldCount !== "number" || !Number.isInteger(input.soldCount) || input.soldCount < 0) {
      throw new AppError("VALIDATION_ERROR", "soldCount must be a non-negative integer", 422);
    }
  }
  validateAndNormalizeTags(input.tags);
}
