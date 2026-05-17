import { createHash } from "node:crypto";

import { escapeHtml, sanitizeText, validateMediaUrl } from "@/lib/hyperframes/sanitize";
import type { HyperFrameAspectRatio, HyperFrameCompositionProduct, HyperFrameCompositionRequest, HyperFrameCompositionResult } from "@/lib/hyperframes/types";

const aspectRatioMap: Record<HyperFrameAspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "1:1": { width: 1080, height: 1080 },
};

export function buildHyperFrameComposition(
  input: HyperFrameCompositionRequest & { product: HyperFrameCompositionProduct; durationSeconds: number },
): HyperFrameCompositionResult {
  const { width, height } = aspectRatioMap[input.aspectRatio];
  const contentText = sanitizeText(input.script ?? input.caption ?? "");
  const safeTitle = sanitizeText(input.product.title);
  const safeImage = validateMediaUrl(input.product.imageUrl);

  const safePrice = input.product.price && input.product.currency
    ? sanitizeText(`${input.product.price} ${input.product.currency}`)
    : null;

  const hasAffiliate = Boolean(input.product.affiliateUrl);
  const disclosureText = hasAffiliate
    ? sanitizeText("โพสต์นี้มีลิงก์แอฟฟิลิเอต ผู้เขียนอาจได้รับค่าคอมมิชชัน")
    : "";

  const compositionId = createHash("sha256")
    .update(JSON.stringify({
      productId: input.productId,
      platform: input.platform,
      aspectRatio: input.aspectRatio,
      durationSeconds: input.durationSeconds,
      contentText,
      title: safeTitle,
      safeImage,
      safePrice,
      hasAffiliate,
    }))
    .digest("hex")
    .slice(0, 16);

  const compositionHtml = `<!doctype html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; background: #020617; color: #fff; font-family: system-ui, sans-serif; }
    .stage { position: relative; overflow: hidden; width: ${width}px; height: ${height}px; background: linear-gradient(145deg, #0f172a, #1e293b); }
    .media { position: absolute; inset: 0; object-fit: cover; width: 100%; height: 100%; opacity: 0.86; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 16%, rgba(0,0,0,.72) 100%); }
    .content { position: absolute; left: 40px; right: 40px; bottom: 170px; font-size: 40px; font-weight: 700; line-height: 1.2; animation: fadeUp .8s ease both; }
    .facts { position: absolute; left: 40px; right: 40px; bottom: 86px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .title { font-size: 30px; font-weight: 700; }
    .price { margin-top: 8px; font-size: 26px; opacity: 0.95; }
    .cta { background: #22c55e; color: #052e16; border-radius: 999px; padding: 14px 22px; font-size: 24px; font-weight: 700; }
    .disclosure { position: absolute; left: 40px; right: 40px; bottom: 18px; font-size: 19px; opacity: 0.9; }
    @keyframes fadeUp { from { transform: translateY(18px); opacity: 0; } to { transform: none; opacity: 1; } }
  </style>
</head>
<body>
  <div class="stage" data-composition-id="${compositionId}" data-start="0" data-width="${width}" data-height="${height}" data-duration="${input.durationSeconds}">
    ${safeImage ? `<img class="media" src="${escapeHtml(safeImage)}" alt="${safeTitle}" />` : ""}
    <div class="overlay"></div>
    <div class="content">${contentText || safeTitle}</div>
    <div class="facts">
      <div>
        <div class="title">${safeTitle}</div>
        ${safePrice ? `<div class="price">${safePrice}</div>` : ""}
      </div>
      <div class="cta">ซื้อผ่านลิงก์แนะนำ</div>
    </div>
    ${disclosureText ? `<div class="disclosure">${disclosureText}</div>` : ""}
  </div>
</body>
</html>`;

  return {
    compositionId,
    compositionHtml,
    metadata: {
      productId: input.productId,
      productTitle: input.product.title,
      platform: input.platform,
      aspectRatio: input.aspectRatio,
      durationSeconds: input.durationSeconds,
      width,
      height,
      hasAffiliateDisclosure: hasAffiliate,
    },
  };
}
