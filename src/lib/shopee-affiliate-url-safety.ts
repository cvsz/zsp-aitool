const ALLOWED_HOSTS = new Set([
  "affiliate.shopee.co.th",
  "shopee.co.th",
  "www.shopee.co.th",
  "shopee.link"
]);

function isPrivateOrLocalHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".localhost")) return true;
  if (/^127\./.test(lower) || lower === "::1") return true;
  if (/^10\./.test(lower) || /^192\.168\./.test(lower)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(lower)) return true;
  if (/^169\.254\./.test(lower) || lower === "0.0.0.0") return true;
  return false;
}

export function isAllowedShopeeAffiliateUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    if (isPrivateOrLocalHostname(url.hostname)) return false;
    return ALLOWED_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
