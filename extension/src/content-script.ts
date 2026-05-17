import type { ProductDraft } from "./types";

function text(selector: string): string {
  const element = document.querySelector(selector);
  return (element?.textContent || "").trim();
}

function collectImages(): string[] {
  const imageNodes = Array.from(document.querySelectorAll("img"));
  const urls = imageNodes
    .map((img) => img.currentSrc || img.src)
    .filter((url) => url && /^https?:\/\//.test(url));
  return Array.from(new Set(urls)).slice(0, 10);
}

function visibleTextCandidates(selectors: string[]): string {
  for (const selector of selectors) {
    const value = text(selector);
    if (value) return value;
  }
  return "";
}

function extractProduct(): ProductDraft {
  const title = visibleTextCandidates(["h1", "[data-sqe='name']", ".pdp-mod-product-badge-title"]);
  const price = visibleTextCandidates(["[data-sqe='price']", ".pqTWkA", ".IZPeQz"]);
  const rating = visibleTextCandidates([".product-rating-overview__rating-score", "[aria-label*='rating']"]);
  const soldCount = visibleTextCandidates([".product-rating-overview__filters", "[class*='sold']"]);
  const description = visibleTextCandidates([".product-detail__description", "[data-sqe='description']"]);

  return {
    title,
    price,
    imageUrls: collectImages(),
    rating: rating || undefined,
    soldCount: soldCount || undefined,
    description: description || undefined,
    pageUrl: location.href
  };
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (typeof message === "object" && message && (message as { type?: string }).type === "ZSP_COLLECT_PRODUCT") {
    sendResponse(extractProduct());
  }
});
