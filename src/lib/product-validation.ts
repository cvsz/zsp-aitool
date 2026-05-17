import { AppError } from "@/lib/errors";

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
