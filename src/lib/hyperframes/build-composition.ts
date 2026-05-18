import { createHash } from "node:crypto";

import { escapeHtml, sanitizeText, validateHttpMediaUrl } from "@/lib/hyperframes/sanitize";
import type {
  HyperFrameAspectRatio,
  HyperFrameCompositionProduct,
  HyperFrameCompositionRequest,
  HyperFrameCompositionResult,
  HyperFrameWatermarkPosition,
} from "@/lib/hyperframes/types";

const watermarkPositionClasses: Record<HyperFrameWatermarkPosition, string> = {
  "top-left": "top: 26px; left: 26px;",
  "top-right": "top: 26px; right: 26px;",
  "bottom-left": "bottom: 26px; left: 26px;",
  "bottom-right": "bottom: 26px; right: 26px;",
  center: "top: 50%; left: 50%; transform: translate(-50%, -50%);",
};
import { validateSubtitles } from "@/lib/hyperframes/subtitles";
import type { HyperFrameAspectRatio, HyperFrameCompositionProduct, HyperFrameCompositionRequest, HyperFrameCompositionResult } from "@/lib/hyperframes/types";
import { alignVoiceoverDuration } from "@/lib/hyperframes/voiceover";
import type { HyperFrameAspectRatio, HyperFrameBrandKit, HyperFrameCompositionProduct, HyperFrameCompositionRequest, HyperFrameCompositionResult } from "@/lib/hyperframes/types";

const aspectRatioMap: Record<HyperFrameAspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "1:1": { width: 1080, height: 1080 },
};

export function buildHyperFrameComposition(
  input: HyperFrameCompositionRequest & { product: HyperFrameCompositionProduct; durationSeconds: number; brandKit?: HyperFrameBrandKit },
): HyperFrameCompositionResult {
  const { width, height } = aspectRatioMap[input.aspectRatio];
  const contentText = sanitizeText(input.script ?? input.caption ?? "");
  const safeTitle = sanitizeText(input.product.title);
  const safeImage = input.product.imageUrl ? validateHttpMediaUrl(input.product.imageUrl) : null;

  const safePrice = input.product.price && input.product.currency
    ? sanitizeText(`${input.product.price} ${input.product.currency}`)
    : null;

  const subtitles = input.subtitles ? validateSubtitles(input.subtitles, input.durationSeconds) : [];
  const hasAffiliate = Boolean(input.product.affiliateUrl);
  const watermarkPosition = input.watermark?.position ?? "bottom-right";
  const watermarkText = sanitizeText(input.watermark?.text ?? "");
  const safeWatermarkLogo = input.watermark?.logoUrl ? validateHttpMediaUrl(input.watermark.logoUrl) : null;
  const hasWatermark = Boolean(watermarkText || safeWatermarkLogo);
  const primaryColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(input.brandKit?.brandColors?.[0] ?? "") ? input.brandKit?.brandColors?.[0] : "#22c55e";
  const safeFont = sanitizeText(input.brandKit?.fontPreference ?? "").replace(/&quot;/g, "").replace(/&#39;/g, "");
  const safeWatermark = sanitizeText(input.brandKit?.watermarkText ?? "");
  const safeCta = sanitizeText(input.brandKit?.defaultCTA ?? "ซื้อผ่านลิงก์แนะนำ") || "ซื้อผ่านลิงก์แนะนำ";
  const safeLogo = input.brandKit?.logoUrl ? validateHttpMediaUrl(input.brandKit.logoUrl) : null;
  const disclosureText = hasAffiliate
    ? sanitizeText("โพสต์นี้มีลิงก์แอฟฟิลิเอต ผู้เขียนอาจได้รับค่าคอมมิชชัน")
    : "";

  const alignedDurationSeconds = alignVoiceoverDuration(input.durationSeconds, input.voiceover);

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
      watermarkPosition,
      hasWatermark,
      voiceover: input.voiceover,
    }))
    .digest("hex")
    .slice(0, 16);

  const compositionHtml = `<!doctype html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; background: #020617; color: #fff; font-family: ${safeFont || 'system-ui, sans-serif'}; }
    .stage { position: relative; overflow: hidden; width: ${width}px; height: ${height}px; background: linear-gradient(145deg, #0f172a, #1e293b); }
    .media { position: absolute; inset: 0; object-fit: cover; width: 100%; height: 100%; opacity: 0.86; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 16%, rgba(0,0,0,.72) 100%); }
    .content { position: absolute; left: 40px; right: 40px; bottom: 170px; font-size: 40px; font-weight: 700; line-height: 1.2; animation: fadeUp .8s ease both; }
    .facts { position: absolute; left: 40px; right: 40px; bottom: 86px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .title { font-size: 30px; font-weight: 700; }
    .price { margin-top: 8px; font-size: 26px; opacity: 0.95; }
    .cta { background: #22c55e; color: #052e16; border-radius: 999px; padding: 14px 22px; font-size: 24px; font-weight: 700; }
     .disclosure { position: absolute; left: 40px; right: 40px; bottom: 18px; font-size: 19px; opacity: 0.9; }
    .captions { position: absolute; left: 40px; right: 40px; bottom: 52px; text-align: center; font-size: 28px; font-weight: 600; text-shadow: 0 2px 8px rgba(0,0,0,.8); }
    .cta { background: ${primaryColor}; color: #052e16; border-radius: 999px; padding: 14px 22px; font-size: 24px; font-weight: 700; }
    .brand-logo { position: absolute; top: 20px; left: 20px; width: 88px; height: 88px; object-fit: contain; }
    .watermark { position: absolute; top: 26px; right: 24px; font-size: 18px; opacity: 0.85; }
    .disclosure { position: absolute; left: 40px; right: 40px; bottom: 18px; font-size: 19px; opacity: 0.9; }
    .watermark { position: absolute; z-index: 5; max-width: 32%; display: inline-flex; gap: 10px; align-items: center; border-radius: 14px; background: rgba(2, 6, 23, .55); border: 1px solid rgba(148, 163, 184, .35); padding: 8px 12px; backdrop-filter: blur(2px); }
    .watermark-text { font-size: 17px; font-weight: 600; opacity: 0.95; }
    .watermark-logo { width: 44px; height: 44px; border-radius: 8px; object-fit: contain; }
    @keyframes fadeUp { from { transform: translateY(18px); opacity: 0; } to { transform: none; opacity: 1; } }
  </style>
</head>
<body>
  <div class="stage" data-composition-id="${compositionId}" data-start="0" data-width="${width}" data-height="${height}" data-duration="${alignedDurationSeconds}">
    ${safeImage ? `<img class="media" src="${escapeHtml(safeImage)}" alt="${safeTitle}" />` : ""}
    <div class="overlay"></div>
    ${safeLogo ? `<img class="brand-logo" src="${escapeHtml(safeLogo)}" alt="brand-logo" />` : ""}
    ${safeWatermark ? `<div class="watermark">${safeWatermark}</div>` : ""}
    <div class="content">${contentText || safeTitle}</div>
    <div class="facts">
      <div>
        <div class="title">${safeTitle}</div>
        ${safePrice ? `<div class="price">${safePrice}</div>` : ""}
      </div>
      <div class="cta">${safeCta}</div>
    </div>
    ${hasWatermark ? `<div class="watermark" style="${watermarkPositionClasses[watermarkPosition]}">${safeWatermarkLogo ? `<img class="watermark-logo" src="${escapeHtml(safeWatermarkLogo)}" alt="watermark logo" />` : ""}${watermarkText ? `<span class="watermark-text">${watermarkText}</span>` : ""}</div>` : ""}
        ${input.burnedInCaptions && subtitles.length ? `<div class="captions" aria-label="captions-preview">${subtitles.map((line) => `<span data-start="${line.start}" data-end="${line.end}" data-style="${line.style}" data-language="${line.language}">${line.text}</span>`).join("<br />")}</div>` : ""}
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
      durationSeconds: alignedDurationSeconds,
      width,
      height,
      hasAffiliateDisclosure: hasAffiliate,
      watermarkEnabled: hasWatermark,
      watermarkPosition: hasWatermark ? watermarkPosition : null,
      voiceover: input.voiceover ?? null,
    },
  };
}
