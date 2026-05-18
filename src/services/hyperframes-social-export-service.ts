import { prisma } from "@/lib/prisma";
import type { HyperframesSocialExportIntentInput } from "@/schemas/hyperframes-social-export.schema";

export interface SocialExportConnector {
  provider: "tiktok" | "reels" | "shorts";
  createManualExportIntent(input: { userId: string; renderJobId: string; notes?: string }): Promise<{ queued: false; mode: "manual" }>;
}

class NoopSocialExportConnector implements SocialExportConnector {
  constructor(public provider: "tiktok" | "reels" | "shorts") {}

  async createManualExportIntent(): Promise<{ queued: false; mode: "manual" }> {
    return { queued: false, mode: "manual" };
  }
}

const connectors: Record<"tiktok" | "reels" | "shorts", SocialExportConnector> = {
  tiktok: new NoopSocialExportConnector("tiktok"),
  reels: new NoopSocialExportConnector("reels"),
  shorts: new NoopSocialExportConnector("shorts"),
};

export function isSocialExportEnabled(): boolean {
  return process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED === "true";
}

export async function createManualSocialExportIntent(userId: string, input: HyperframesSocialExportIntentInput) {
  const connector = connectors[input.provider];
  const result = await connector.createManualExportIntent({ userId, renderJobId: input.renderJobId, notes: input.notes });

  await prisma.hyperFrameSocialExportAuditEvent.create({
    data: {
      userId,
      renderJobId: input.renderJobId,
      provider: input.provider,
      eventType: "MANUAL_EXPORT_INTENT",
      metadata: { confirmation: true, mode: result.mode },
    },
  });

  return result;
}
