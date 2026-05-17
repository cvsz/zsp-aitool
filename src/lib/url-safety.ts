import dns from "node:dns/promises";
import net from "node:net";

import { AppError } from "@/lib/errors";

function isBlockedIp(host: string): boolean {
  if (net.isIP(host) === 4) {
    const [a, b] = host.split(".").map(Number);
    if (
      a === 127 ||
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && host.split(".")[2] === "100") ||
      (a === 203 && b === 0 && host.split(".")[2] === "113") ||
      a === 0
    ) return true;
  }
  if (net.isIP(host) === 6) {
    const value = host.toLowerCase();
    if (
      value === "::1" ||
      value === "::" ||
      value.startsWith("fe80") ||
      value.startsWith("fc") ||
      value.startsWith("fd") ||
      value.startsWith("::ffff:127.") ||
      value.startsWith("::ffff:10.") ||
      value.startsWith("::ffff:192.168.")
    ) return true;
  }
  return false;
}

export async function assertSafeImportUrl(rawUrl: string): Promise<void> {
  const parsed = new URL(rawUrl);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError("VALIDATION_ERROR", "Only HTTP/HTTPS URLs are allowed for product import", 400);
  }

  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || isBlockedIp(host)) {
    throw new AppError("VALIDATION_ERROR", "Private or local network URLs are not allowed", 400);
  }

  const resolved = await dns.lookup(host, { all: true });
  if (resolved.some((record) => isBlockedIp(record.address)) || resolved.some((record) => record.address === "169.254.169.254")) {
    throw new AppError("VALIDATION_ERROR", "Private or local network URLs are not allowed", 400);
  }
}
