import { AppError } from "@/lib/errors";

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/i,
  /^fc/i,
  /^fd/i,
];

const DISALLOWED_HOSTS = new Set(["[::1]"]);

function isPrivateHostname(hostname: string): boolean {
  if (DISALLOWED_HOSTS.has(hostname)) return true;
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

export function assertSafeImportUrl(rawUrl: string): void {
  const parsed = new URL(rawUrl);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError("VALIDATION_ERROR", "Only HTTP/HTTPS URLs are allowed for product import", 400);
  }

  if (isPrivateHostname(parsed.hostname)) {
    throw new AppError("VALIDATION_ERROR", "Private or local network URLs are not allowed", 400);
  }
}

