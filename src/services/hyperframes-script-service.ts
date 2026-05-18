import { prisma } from "@/lib/prisma";
import { buildProductFactSummary, getDefaultDisclosure } from "@/services/ai/ContentSafety";
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

function containsUnsafeClaim(text: string): boolean {
  return /(รีวิวจากผู้ใช้จริง|guaranteed|100%|ดีที่สุดในโลก|clinically proven)/i.test(text);
}

export async function generateHyperframesScript(userId: string, input: HyperframesScriptRequest, product: ProductFacts) {
  const disclosure = product.affiliateUrl ? getDefaultDisclosure(input.language === "th" ? "th" : "en") : null;
  const hook = `แนะนำ ${product.title} สำหรับ ${input.platform}`;
  const factSummary = buildProductFactSummary({
    title: product.title,
    description: product.description ?? undefined,
    category: product.category ?? undefined,
    currency: product.currency,
    price: Number(product.price),
    shopName: product.shopName ?? undefined,
  });
  const script = `${hook}\n${factSummary}\nสรุปจุดเด่นจากข้อมูลสินค้าที่ยืนยันแล้วเท่านั้น`;
  const warnings = containsUnsafeClaim(script) ? ["Potential exaggerated claim or fake-review style language detected"] : [];

  const beats = [
    { atSecond: 0, text: `เปิดด้วยปัญหา/ความต้องการของลูกค้า`, safe: true },
    { atSecond: Math.floor(input.durationSeconds / 3), text: `โชว์สินค้า: ${product.title}`, safe: true },
    { atSecond: Math.floor((input.durationSeconds * 2) / 3), text: `บอกข้อมูลจริง: ${product.price} ${product.currency}`, safe: true },
  ];

  const captions = beats.map((beat) => ({ start: beat.atSecond, end: Math.min(input.durationSeconds, beat.atSecond + 4), text: beat.text, style: "default", language: input.language }));
  const metadata = { productId: product.id, platform: input.platform, aspectRatio: input.aspectRatio, durationSeconds: input.durationSeconds, safe: warnings.length === 0, renderTriggered: false };

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
