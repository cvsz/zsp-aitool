import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";
import { productService } from "@/services/ProductService";

const beatSchema = z.object({
  atSecond: z.number().int().min(0),
  text: z.string().trim().min(1).max(300),
});

const bodySchema = z.object({
  productId: z.string().min(1),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
  durationSeconds: z.number().int().min(3).max(60),
  visualStyle: z.string().trim().max(120).optional(),
  cta: z.string().trim().max(180).optional(),
  beats: z.array(beatSchema).min(1).max(24),
});

function sanitizeText(text: string): string {
  const withoutControlChars = Array.from(text)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return !(code <= 0x1f || code === 0x7f);
    })
    .join("");

  const escaped = withoutControlChars
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  return escaped.trim();
}

export const POST = withAuth(async (request) => {
  try {
    const input = bodySchema.parse(await request.json());
    await productService.getById(request.auth.userId, input.productId);

    const normalizedBeats = input.beats
      .map((beat) => ({ atSecond: beat.atSecond, text: sanitizeText(beat.text) }))
      .filter((beat) => beat.text.length > 0 && beat.atSecond <= input.durationSeconds)
      .sort((a, b) => a.atSecond - b.atSecond || a.text.localeCompare(b.text));

    if (normalizedBeats.length === 0) {
      return NextResponse.json({ ok: false, error: { code: "INVALID_BEATS", message: "beats ไม่ถูกต้อง" } }, { status: 422 });
    }

    const compositionMetadata = {
      productId: input.productId,
      aspectRatio: input.aspectRatio,
      durationSeconds: input.durationSeconds,
      scenes: normalizedBeats.map((beat, idx) => ({ id: `scene-${idx + 1}`, start: beat.atSecond, end: Math.min(input.durationSeconds, beat.atSecond + 4), text: beat.text })),
      timings: normalizedBeats.map((beat, idx, arr) => ({ start: beat.atSecond, end: idx < arr.length - 1 ? arr[idx + 1].atSecond : input.durationSeconds })),
      captions: normalizedBeats.map((beat, idx, arr) => ({ start: beat.atSecond, end: Math.min(input.durationSeconds, idx < arr.length - 1 ? arr[idx + 1].atSecond : beat.atSecond + 4), text: beat.text })),
      visualStyle: sanitizeText(input.visualStyle ?? "clean-minimal"),
      cta: sanitizeText(input.cta ?? "กดดูรายละเอียดสินค้าจากลิงก์แนะนำได้เลย"),
      affiliateDisclosure: "โพสต์นี้มีลิงก์แนะนำสินค้า (affiliate) ผู้เขียนอาจได้รับค่าคอมมิชชันโดยไม่มีค่าใช้จ่ายเพิ่มสำหรับคุณ",
      renderTriggered: false,
    };
    return NextResponse.json({ ok: true, data: compositionMetadata });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    return NextResponse.json({ ok: false, error: { code: "SCRIPT_TO_COMPOSITION_FAILED", message: "ไม่สามารถแปลงสคริปต์เป็น composition metadata ได้" } }, { status: 400 });
  }
});
