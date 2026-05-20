const SHOPEE_HOST_ALLOWLIST = new Set([
  "shopee.co.th",
  "www.shopee.co.th",
  "affiliate.shopee.co.th",
  "shopee.link",
]);

export function isAllowedShopeeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return SHOPEE_HOST_ALLOWLIST.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function assertAllowedShopeeUrl(value: string, fieldName: string): string {
  if (!isAllowedShopeeUrl(value)) {
    throw new Error(`${fieldName} must be a valid Shopee HTTPS URL`);
  }
  return value;
}
