import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";

const bodySchema = z.object({
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
  durationSeconds: z.number().int().min(3).max(60),
  beats: z.array(z.object({ atSecond: z.number().int().min(0), text: z.string().min(1).max(300) })).min(1),
});

export const POST = withAuth(async (request) => {
  try {
    const input = bodySchema.parse(await request.json());
    const compositionMetadata = {
      aspectRatio: input.aspectRatio,
      durationSeconds: input.durationSeconds,
      scenes: input.beats.map((beat, idx) => ({ id: `scene-${idx + 1}`, start: beat.atSecond, text: beat.text.replace(/<[^>]+>/g, "") })),
      renderTriggered: false,
    };
    return NextResponse.json({ ok: true, data: compositionMetadata });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    return NextResponse.json({ ok: false, error: { code: "SCRIPT_TO_COMPOSITION_FAILED", message: "ไม่สามารถแปลงสคริปต์เป็น composition metadata ได้" } }, { status: 400 });
  }
});
