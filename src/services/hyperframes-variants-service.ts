import { getDefaultDisclosure } from "@/services/ai/ContentSafety";
import { prisma } from "@/lib/prisma";
import type { HyperframesVariantOutput, HyperframesVariantsRequest } from "@/schemas/hyperframes-variants.schema";

const VARIANT_CONFIG: Record<string, { aspectRatio: "9:16" | "1:1" | "16:9"; durationSeconds: number; cta: string }> = {
  tiktok: { aspectRatio: "9:16", durationSeconds: 15, cta: "กดลิงก์ที่หน้าโปรไฟล์เพื่อดูดีลล่าสุด" },
  reels: { aspectRatio: "9:16", durationSeconds: 20, cta: "แตะดูรายละเอียดสินค้าและโปรโมชันตอนนี้" },
  shorts: { aspectRatio: "9:16", durationSeconds: 30, cta: "ดูรายละเอียดและเช็คราคาล่าสุดได้ที่ลิงก์" },
  facebook: { aspectRatio: "1:1", durationSeconds: 25, cta: "คลิกลิงก์เพื่อดูสเปกและโปรโมชันล่าสุด" },
  generic: { aspectRatio: "16:9", durationSeconds: 20, cta: "ดูข้อมูลสินค้าเพิ่มเติมได้จากลิงก์นี้" },
};

function normalizeCaptions(beats: Array<{ atSecond: number; text: string }>, durationSeconds: number) {
  return beats.map((beat) => ({ start: beat.atSecond, end: Math.min(durationSeconds, beat.atSecond + 4), text: beat.text }));
}

export async function generatePlatformVariants(userId: string, input: HyperframesVariantsRequest): Promise<HyperframesVariantOutput[]> {
  const product = await prisma.product.findFirst({ where: { id: input.productId, userId, deletedAt: null }, select: { affiliateUrl: true } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const sourceBeats: Array<{ atSecond: number; text: string }> = input.beats ?? await prisma.hyperFrameScriptGeneration.findFirst({
    where: { id: input.baseScriptId, userId, productId: input.productId },
    select: { beats: true },
  }).then((record) => {
    if (!record || !Array.isArray(record.beats)) throw new Error("BASE_SCRIPT_NOT_FOUND");
    return (record.beats as Array<{ atSecond: number; text: string }>);
  });

  const disclosure = product.affiliateUrl ? getDefaultDisclosure("th") : null;

  return [...new Set(input.targetPlatforms)].map((platform) => {
    const cfg = VARIANT_CONFIG[platform];
    const captions = normalizeCaptions(sourceBeats, cfg.durationSeconds);
    return {
      platform,
      aspectRatio: cfg.aspectRatio,
      durationSeconds: cfg.durationSeconds,
      cta: cfg.cta,
      captions,
      disclosure,
      renderTriggered: false,
    };
  });
}
