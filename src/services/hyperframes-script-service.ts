import { prisma } from "@/lib/prisma";
import { getDefaultDisclosure } from "@/services/ai/ContentSafety";
import type { HyperframesScriptRequest } from "@/schemas/hyperframes-script.schema";

type ProductFacts = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  currency: string;
  shopName: string | null;
  category: string | null;
  affiliateUrl: string | null;
};

type BeatType = "hook" | "problem" | "productDemo" | "benefits" | "CTA" | "disclosure";

const disallowedPatterns = [
  /fake review/i,
  /testimonial/i,
  /รีวิวผู้ใช้จริง/i,
  /lowest price/i,
  /best price/i,
  /รับประกัน/i,
  /warranty/i,
  /limited stock/i,
  /หมดเขตวันนี้/i,
  /100%/i,
  /guaranteed/i,
  /clinically proven/i,
];

function getLanguageText(language: HyperframesScriptRequest["language"], th: string, en: string): string {
  if (language === "th") return th;
  if (language === "en") return en;
  return `${th} / ${en}`;
}

function buildSafeBeatText(type: BeatType, input: HyperframesScriptRequest, product: ProductFacts, disclosure: string | null): string {
  const isTH = input.language === "th";
  switch (type) {
    case "hook":
      return getLanguageText(input.language, `กำลังมองหา ${product.category ?? "สินค้าที่ใช่"} อยู่ไหม?`, `Looking for the right ${product.category ?? "product"}?`);
    case "problem":
      return getLanguageText(input.language, "ปัญหาที่เจอบ่อย: เลือกสินค้ายาก ข้อมูลไม่ชัด", "Common problem: choosing products with unclear info.");
    case "productDemo":
      return getLanguageText(input.language, `ลองดู ${product.title} จากร้าน ${product.shopName ?? "ที่น่าเชื่อถือ"}`,
        `Check out ${product.title} from ${product.shopName ?? "a trusted shop"}.`);
    case "benefits":
      return getLanguageText(input.language, `จุดเด่นตามข้อมูลจริง: ราคา ${product.price} ${product.currency}${product.description ? `, ${product.description}` : ""}`,
        `Fact-based highlights: ${product.price} ${product.currency}${product.description ? `, ${product.description}` : ""}`);
    case "CTA":
      return getLanguageText(input.language, "ถ้าสนใจ กดดูรายละเอียดเพิ่มเติมก่อนตัดสินใจซื้อ", "If interested, check full details before purchasing.");
    case "disclosure":
      return disclosure ?? (isTH ? "" : "");
  }
}

function enforceSafety(beats: Array<{ type: BeatType; text: string }>): void {
  const all = beats.map((x) => x.text).join("\n");
  if (disallowedPatterns.some((p) => p.test(all))) {
    throw new Error("UNSAFE_CLAIM_BLOCKED");
  }
}

export async function generateHyperframesScript(userId: string, input: HyperframesScriptRequest, product: ProductFacts) {
  const disclosure = product.affiliateUrl ? getDefaultDisclosure(input.language === "th" ? "th" : "en") : null;
  if (product.affiliateUrl && !disclosure) throw new Error("MISSING_DISCLOSURE");

  const beatOrder: BeatType[] = ["hook", "problem", "productDemo", "benefits", "CTA", "disclosure"];
  const step = Math.max(1, Math.floor(input.durationSeconds / beatOrder.length));

  const beats = beatOrder.map((type, idx) => ({
    type,
    atSecond: Math.min(input.durationSeconds - 1, idx * step),
    text: buildSafeBeatText(type, input, product, disclosure),
    safe: true,
  }));

  enforceSafety(beats.map((b) => ({ type: b.type, text: b.text })));

  const script = beats.map((b) => `[${b.type}] ${b.text}`).join("\n");
  const warnings: string[] = [];
  const captions = beats.map((beat) => ({ start: beat.atSecond, end: Math.min(input.durationSeconds, beat.atSecond + 4), text: beat.text, style: "default", language: input.language }));
  const metadata = {
    productId: product.id,
    platform: input.platform,
    aspectRatio: input.aspectRatio,
    durationSeconds: input.durationSeconds,
    safe: warnings.length === 0,
    renderTriggered: false,
    affiliateRequired: Boolean(product.affiliateUrl),
  };

  await prisma.hyperFrameScriptGeneration.create({
    data: {
      userId,
      productId: product.id,
      platform: input.platform,
      tone: input.tone,
      language: input.language,
      requestPayload: input,
      script,
      beats,
      captions,
      metadata,
      disclosure,
      warnings,
    },
  });

  return { script, beats, captions, metadata, disclosure, warnings };
}
