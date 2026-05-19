import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";
import { hyperframesSocialExportIntentSchema } from "@/schemas/hyperframes-social-export.schema";
import { createManualSocialExportIntent, isSocialExportEnabled } from "@/services/hyperframes-social-export-service";

export const POST = withAuth(async (request) => {
  if (!isSocialExportEnabled()) return NextResponse.json({ ok: false, error: { code: "SOCIAL_EXPORT_DISABLED", message: "HyperFrames social export is disabled" } }, { status: 503 });
  try {
    const input = hyperframesSocialExportIntentSchema.parse(await request.json());
    const result = await createManualSocialExportIntent(request.auth.userId, input);
    return NextResponse.json({ ok: true, data: { provider: input.provider, renderJobId: input.renderJobId, ...result, autoPosted: false } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: { code: "INVALID_EXPORT_REQUEST", message: "Explicit confirmation is required", details: error.flatten() } }, { status: 400 });
    throw error;
  }
});
