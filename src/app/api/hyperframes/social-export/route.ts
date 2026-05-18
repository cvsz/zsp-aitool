import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getSocialExportConnector, isSocialExportEnabled, socialExportProviders } from "@/lib/hyperframes/social-export";

const bodySchema = z.object({ renderJobId: z.string().min(1), provider: z.enum(socialExportProviders), confirm: z.literal(true), note: z.string().max(500).optional() });

export const POST = withAuth(async (request) => {
  if (!isSocialExportEnabled()) return NextResponse.json({ ok: false, error: { code: "SOCIAL_EXPORT_DISABLED", message: "HyperFrames social export is disabled" } }, { status: 503 });

  const payload = bodySchema.parse(await request.json());
  const job = await prisma.hyperFrameRenderJob.findFirst({ where: { id: payload.renderJobId, userId: request.auth.userId, deletedAt: null }, select: { id: true } });
  if (!job) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Render job not found" } }, { status: 404 });

  const connector = getSocialExportConnector(payload.provider);
  const result = await connector.createManualExport({ ...payload, userId: request.auth.userId });

  await prisma.aPIUsageLog.create({
    data: {
      userId: request.auth.userId,
      provider: `hyperframes-social-${payload.provider}`,
      endpoint: "manual-export-intent",
      status: "COMPLETED",
      metadata: { renderJobId: payload.renderJobId, provider: payload.provider, mode: "manual", confirmed: true, note: payload.note ?? null, autoPost: false },
    },
  });

  return NextResponse.json({ ok: true, data: { ...result, renderJobId: payload.renderJobId, autoPost: false } });
});
