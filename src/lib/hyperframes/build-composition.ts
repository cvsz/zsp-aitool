import { createHash } from "node:crypto";

import { escapeHtml, sanitizeText, validateHttpMediaUrl } from "@/lib/hyperframes/sanitize";
import { validateSubtitles } from "@/lib/hyperframes/subtitles";
import { alignVoiceoverDuration } from "@/lib/hyperframes/voiceover";
import type { HyperFrameAspectRatio, HyperFrameBrandKit, HyperFrameCompositionProduct, HyperFrameCompositionRequest, HyperFrameCompositionResult, HyperFrameWatermarkPosition } from "@/lib/hyperframes/types";

const aspectRatioMap: Record<HyperFrameAspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "1:1": { width: 1080, height: 1080 },
};

const watermarkPositionStyles: Record<HyperFrameWatermarkPosition, string> = {
  "top-left": "top: 26px; left: 26px;",
  "top-right": "top: 26px; right: 26px;",
  "bottom-left": "bottom: 26px; left: 26px;",
  "bottom-right": "bottom: 26px; right: 26px;",
  center: "top: 50%; left: 50%; transform: translate(-50%, -50%);",
};

export function buildHyperFrameComposition(input: HyperFrameCompositionRequest & { product: HyperFrameCompositionProduct; brandKit?: HyperFrameBrandKit }): HyperFrameCompositionResult {
  const { width, height } = aspectRatioMap[input.aspectRatio];
  const contentText = sanitizeText(input.script ?? input.caption ?? "");
  const safeTitle = sanitizeText(input.product.title);
  const safeImage = input.product.imageUrl ? validateHttpMediaUrl(input.product.imageUrl) : null;
  const safePrice = input.product.price && input.product.currency ? sanitizeText(`${input.product.price} ${input.product.currency}`) : null;
  const subtitles = input.subtitles ? validateSubtitles(input.subtitles, input.durationSeconds) : [];
  const hasAffiliate = Boolean(input.product.affiliateUrl);
  const watermarkPosition = input.watermark?.position ?? "bottom-right";
  const watermarkText = sanitizeText(input.watermark?.text ?? input.brandKit?.watermarkText ?? "");
  const watermarkLogo = input.watermark?.logoUrl ?? input.brandKit?.logoUrl ?? null;
  const safeWatermarkLogo = watermarkLogo ? validateHttpMediaUrl(watermarkLogo) : null;
  const hasWatermark = Boolean(watermarkText || safeWatermarkLogo);
  const primaryColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(input.brandKit?.brandColors?.[0] ?? "") ? input.brandKit?.brandColors?.[0] : "#22c55e";
  const safeFont = sanitizeText(input.brandKit?.fontPreference ?? "").replace(/&quot;/g, "").replace(/&#39;/g, "");
  const safeCta = sanitizeText(input.brandKit?.defaultCTA ?? "ซื้อผ่านลิงก์แนะนำ") || "ซื้อผ่านลิงก์แนะนำ";
  const alignedDurationSeconds = alignVoiceoverDuration(input.durationSeconds, input.voiceover);

  const compositionId = createHash("sha256")
    .update(JSON.stringify({ productId: input.productId, platform: input.platform, aspectRatio: input.aspectRatio, durationSeconds: input.durationSeconds, contentText, title: safeTitle, safeImage, safePrice, hasAffiliate, watermarkPosition, hasWatermark, voiceover: input.voiceover }))
    .digest("hex")
    .slice(0, 16);

  const captionHtml = subtitles.length > 0
    ? `<div class="captions">${escapeHtml(subtitles.map((subtitle) => subtitle.text).join(" • "))}</div>`
    : contentText
      ? `<div class="content">${contentText}</div>`
      : "";

  const compositionHtml = `<!doctype html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; background: #020617; color: #fff; font-family: ${safeFont || "system-ui, sans-serif"}; }
    .stage { position: relative; overflow: hidden; width: ${width}px; height: ${height}px; background: linear-gradient(145deg, #0f172a, #1e293b); }
    .media { position: absolute; inset: 0; object-fit: cover; width: 100%; height: 100%; opacity: 0.86; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 16%, rgba(0,0,0,.72) 100%); }
    .content { position: absolute; left: 40px; right: 40px; bottom: 170px; font-size: 40px; font-weight: 700; line-height: 1.2; animation: fadeUp .8s ease both; }
    .captions { position: absolute; left: 40px; right: 40px; bottom: 150px; text-align: center; font-size: 34px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,.8); }
    .facts { position: absolute; left: 40px; right: 40px; bottom: 86px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .title { font-size: 30px; font-weight: 700; }
    .price { margin-top: 8px; font-size: 26px; opacity: 0.95; }
    .cta { background: ${primaryColor}; color: #052e16; border-radius: 999px; padding: 14px 22px; font-size: 24px; font-weight: 700; }
    .disclosure { position: absolute; left: 40px; right: 40px; bottom: 18px; font-size: 19px; opacity: 0.9; }
    .watermark { position: absolute; z-index: 5; ${watermarkPositionStyles[watermarkPosition]} font-size: 18px; opacity: .85; }
    .watermark img { max-width: 120px; max-height: 64px; object-fit: contain; display: block; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <div class="stage" data-hf-duration="${alignedDurationSeconds}">
    ${safeImage ? `<img class="media" src="${escapeHtml(safeImage)}" alt="" />` : ""}
    <div class="overlay"></div>
    ${captionHtml}
    <div class="facts"><div><div class="title">${safeTitle}</div>${safePrice ? `<div class="price">${safePrice}</div>` : ""}</div><div class="cta">${safeCta}</div></div>
    ${hasWatermark ? `<div class="watermark">${safeWatermarkLogo ? `<img src="${escapeHtml(safeWatermarkLogo)}" alt="" />` : ""}${watermarkText ? `<span>${watermarkText}</span>` : ""}</div>` : ""}
    ${hasAffiliate ? `<div class="disclosure">${escapeHtml("โพสต์นี้มีลิงก์แอฟฟิลิเอต ผู้เขียนอาจได้รับค่าคอมมิชชัน")}</div>` : ""}
  </div>
</body>
</html>`;

  return {
    compositionId,
    compositionHtml,
    metadata: { productId: input.productId, productTitle: input.product.title, platform: input.platform, aspectRatio: input.aspectRatio, durationSeconds: alignedDurationSeconds, width, height, hasAffiliateDisclosure: hasAffiliate, watermarkEnabled: hasWatermark, watermarkPosition: hasWatermark ? watermarkPosition : null, voiceover: input.voiceover ?? null },
  };
}
