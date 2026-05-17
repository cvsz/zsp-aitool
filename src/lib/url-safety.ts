import dns from "node:dns/promises";
import net from "node:net";

import { AppError } from "@/lib/errors";

function isBlockedIp(host: string): boolean {
  const ipVersion = net.isIP(host);
  if (ipVersion === 4) {
    const parts = host.split(".").map(Number);
    const [a, b, c] = parts;
    if (
      a === 127 ||
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      a === 0
    ) return true;
  }
  if (ipVersion === 6) {
    const value = host.toLowerCase();
    if (
      value === "::1" ||
      value === "::" ||
      value.startsWith("fe80") ||
      value.startsWith("fc") ||
      value.startsWith("fd") ||
      value.startsWith("ff") ||
      value.startsWith("::ffff:127.") ||
      value.startsWith("::ffff:10.") ||
      value.startsWith("::ffff:192.168.") ||
      value.startsWith("::ffff:172.16.") ||
      value.startsWith("::ffff:172.17.") ||
      value.startsWith("::ffff:172.18.") ||
      value.startsWith("::ffff:172.19.") ||
      value.startsWith("::ffff:172.2") ||
      value.startsWith("::ffff:169.254.") ||
      value.startsWith("::ffff:0.")
    ) return true;
  }
  return false;
}

export async function assertSafeImportUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError("VALIDATION_ERROR", "URL must be valid", 400);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError("VALIDATION_ERROR", "Only HTTP/HTTPS URLs are allowed for product import", 400);
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    isBlockedIp(host)
  ) {
    throw new AppError("VALIDATION_ERROR", "Private or local network URLs are not allowed", 400);
  }

  const resolved = await dns.lookup(host, { all: true });
  if (resolved.some((record) => isBlockedIp(record.address)) || resolved.some((record) => record.address === "169.254.169.254")) {
    throw new AppError("VALIDATION_ERROR", "Private or local network URLs are not allowed", 400);
  }
}

export const SAFE_FETCH_MAX_BYTES = 1024 * 1024;

export async function fetchWithSafety(rawUrl: string): Promise<string> {
  await assertSafeImportUrl(rawUrl);
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), 5000);
  let currentUrl = rawUrl;

  try {
    for (let i = 0; i < 3; i += 1) {
      const response = await fetch(currentUrl, {
        signal: timeoutController.signal,
        headers: { "user-agent": "zsp-aitool/import-review" },
        redirect: "manual",
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new AppError("VALIDATION_ERROR", "Redirect location is missing", 400);
        currentUrl = new URL(location, currentUrl).toString();
        await assertSafeImportUrl(currentUrl);
        continue;
      }

      if (response.status < 200 || response.status >= 300) {
        throw new AppError("VALIDATION_ERROR", "Unable to import URL content", 400);
      }

      const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
      if (contentType && !contentType.includes("text/html")) {
        throw new AppError("VALIDATION_ERROR", "Unsupported content-type for URL import", 415);
      }

      const body = await response.text();
      if (body.length > SAFE_FETCH_MAX_BYTES) throw new AppError("VALIDATION_ERROR", "Response too large", 413);
      return body;
    }
    throw new AppError("VALIDATION_ERROR", "Too many redirects", 400);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("VALIDATION_ERROR", "Network request failed", 400);
  } finally {
    clearTimeout(timeout);
  }
}
