import { Prisma, ShopeeAffiliateSocialChannel, ShopeeAffiliateSocialDraftStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SocialChannel = "facebook" | "threads" | "x" | "instagram" | "tiktok" | "youtube_shorts";

const toDbChannel: Record<SocialChannel, ShopeeAffiliateSocialChannel> = {
  facebook: ShopeeAffiliateSocialChannel.FACEBOOK,
  threads: ShopeeAffiliateSocialChannel.THREADS,
  x: ShopeeAffiliateSocialChannel.X,
  instagram: ShopeeAffiliateSocialChannel.INSTAGRAM,
  tiktok: ShopeeAffiliateSocialChannel.TIKTOK,
  youtube_shorts: ShopeeAffiliateSocialChannel.YOUTUBE_SHORTS,
};

const fromDbChannel: Record<ShopeeAffiliateSocialChannel, SocialChannel> = {
  FACEBOOK: "facebook",
  THREADS: "threads",
  X: "x",
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
  YOUTUBE_SHORTS: "youtube_shorts",
};

export class ShopeeAffiliateSocialDraftService {
  async create(userId: string, ingestionId: string, channel: SocialChannel, content: string) {
    const ingestion = await prisma.shopeeAffiliateIngestion.findFirst({ where: { id: ingestionId, userId, deletedAt: null } });
    if (!ingestion) throw new Error("INGESTION_NOT_FOUND");

    const latest = await prisma.shopeeAffiliateSocialDraft.findFirst({ where: { userId, ingestionId, channel: toDbChannel[channel], deletedAt: null }, orderBy: { version: "desc" } });
    const created = await prisma.shopeeAffiliateSocialDraft.create({
      data: { userId, ingestionId, channel: toDbChannel[channel], content, status: ShopeeAffiliateSocialDraftStatus.READY_FOR_REVIEW, version: (latest?.version ?? 0) + 1, productId: ingestion.productId },
    });
    return this.safe(created);
  }

  async update(userId: string, draftId: string, content: string) {
    const updated = await prisma.shopeeAffiliateSocialDraft.updateMany({ where: { id: draftId, userId, deletedAt: null }, data: { content, status: ShopeeAffiliateSocialDraftStatus.READY_FOR_REVIEW } });
    if (!updated.count) throw new Error("DRAFT_NOT_FOUND");
    const row = await prisma.shopeeAffiliateSocialDraft.findFirstOrThrow({ where: { id: draftId, userId } });
    return this.safe(row);
  }

  async markCopied(userId: string, draftId: string) {
    const updated = await prisma.shopeeAffiliateSocialDraft.updateMany({ where: { id: draftId, userId, deletedAt: null }, data: { status: ShopeeAffiliateSocialDraftStatus.COPIED, copiedAt: new Date() } });
    if (!updated.count) throw new Error("DRAFT_NOT_FOUND");
    const row = await prisma.shopeeAffiliateSocialDraft.findFirstOrThrow({ where: { id: draftId, userId } });
    return this.safe(row);
  }

  private safe(row: {id:string;ingestionId:string;channel:ShopeeAffiliateSocialChannel;status:ShopeeAffiliateSocialDraftStatus;version:number;content:string;createdAt:Date;updatedAt:Date;copiedAt:Date|null;}) {
    return { ...row, channel: fromDbChannel[row.channel], status: row.status.toLowerCase(), createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), copiedAt: row.copiedAt?.toISOString() ?? null };
  }
}

export const shopeeAffiliateSocialDraftService = new ShopeeAffiliateSocialDraftService();
