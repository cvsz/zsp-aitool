import { Prisma, ShopeeAffiliateSocialChannel, ShopeeAffiliateSocialDraftStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SocialChannel = "facebook" | "threads" | "x" | "instagram" | "tiktok" | "youtube_shorts";
export type SocialDraftStatus = "draft" | "ready_for_review" | "copied" | "archived" | "rejected";

const LONG_DISCLOSURE = "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ซื้อ";
const SHORT_DISCLOSURE = "ลิงก์นี้เป็นลิงก์ Affiliate";

const UNSAFE_PATTERNS = [/รับประกันรายได้/giu, /การันตี.*ยอดขาย/giu, /รวยแน่นอน/giu, /รักษาโรค/giu, /ผลลัพธ์ 100%/giu];

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
  async generateInitialDraft(userId: string, ingestionId: string, channel: SocialChannel) {
    const ingestion = await prisma.shopeeAffiliateIngestion.findFirst({ where: { id: ingestionId, userId, deletedAt: null } });
    if (!ingestion) throw new Error("INGESTION_NOT_FOUND");
    const disclosure = channel === "x" ? SHORT_DISCLOSURE : LONG_DISCLOSURE;
    const hashtags = ["instagram", "tiktok", "youtube_shorts"].includes(channel) ? "#ShopeeFinds #Affiliate" : null;
    const body = this.sanitizeContent([`แนะนำ: ${ingestion.title ?? "สินค้า Shopee"}`, disclosure, ingestion.affiliateUrl ? `ลิงก์: ${ingestion.affiliateUrl}` : ""].filter(Boolean).join("\n"));

    return this.create(userId, {
      ingestionId,
      productId: ingestion.productId,
      affiliateLinkId: null,
      channel,
      title: ingestion.title ?? "Shopee Affiliate Draft",
      content: body,
      disclosure,
      hashtags,
      metadata: { source: "auto_generated", sourceType: ingestion.source },
      source: "ingestion",
    });
  }

  async create(userId: string, input: { ingestionId: string; productId?: string | null; affiliateLinkId?: string | null; channel: SocialChannel; title?: string | null; content: string; disclosure?: string | null; hashtags?: string | null; metadata?: Prisma.JsonValue; source?: string | null; }) {
    const sanitized = this.sanitizeContent(input.content);
    const disclosure = (input.disclosure ?? "").trim() || (input.channel === "x" ? SHORT_DISCLOSURE : LONG_DISCLOSURE);
    const created = await prisma.shopeeAffiliateSocialDraft.create({
      data: {
        userId,
        ingestionId: input.ingestionId,
        productId: input.productId ?? null,
        affiliateLinkId: input.affiliateLinkId ?? null,
        channel: toDbChannel[input.channel],
        title: input.title ?? null,
        content: sanitized,
        disclosure,
        hashtags: input.hashtags ?? null,
        metadata: input.metadata ?? Prisma.JsonNull,
        source: input.source ?? "manual",
      },
    });
    await this.createVersion(userId, created.id, created.version, created.content, "create");
    return this.safe(created);
  }

  async list(userId: string, filters: { channel?: SocialChannel; status?: SocialDraftStatus; productId?: string } = {}) {
    const rows = await prisma.shopeeAffiliateSocialDraft.findMany({ where: { userId, deletedAt: null, channel: filters.channel ? toDbChannel[filters.channel] : undefined, status: filters.status ? filters.status.toUpperCase() as ShopeeAffiliateSocialDraftStatus : undefined, productId: filters.productId }, orderBy: { updatedAt: "desc" } });
    return rows.map((row) => this.safe(row));
  }

  async getById(userId: string, draftId: string) {
    const row = await prisma.shopeeAffiliateSocialDraft.findFirst({ where: { id: draftId, userId, deletedAt: null } });
    if (!row) throw new Error("DRAFT_NOT_FOUND");
    return this.safe(row);
  }

  async update(userId: string, draftId: string, content: string, editor = "user") {
    const current = await prisma.shopeeAffiliateSocialDraft.findFirst({ where: { id: draftId, userId, deletedAt: null } });
    if (!current) throw new Error("DRAFT_NOT_FOUND");
    const row = await prisma.shopeeAffiliateSocialDraft.update({
      where: { id: draftId },
      data: { content: this.sanitizeContent(content), version: { increment: 1 }, status: ShopeeAffiliateSocialDraftStatus.DRAFT }
    });
    await this.createVersion(userId, row.id, row.version, row.content, editor);
    return this.safe(row);
  }

  async markCopied(userId: string, draftId: string) {
    const row = await prisma.shopeeAffiliateSocialDraft.findFirst({ where: { id: draftId, userId, deletedAt: null } });
    if (!row) throw new Error("DRAFT_NOT_FOUND");
    this.ensureDisclosure(row.content, row.disclosure);
    const updated = await prisma.shopeeAffiliateSocialDraft.update({ where: { id: draftId }, data: { status: ShopeeAffiliateSocialDraftStatus.COPIED, copiedAt: new Date() } });
    return this.safe(updated);
  }

  async markReadyForReview(userId: string, draftId: string) {
    const row = await prisma.shopeeAffiliateSocialDraft.findFirst({ where: { id: draftId, userId, deletedAt: null } });
    if (!row) throw new Error("DRAFT_NOT_FOUND");
    this.ensureDisclosure(row.content, row.disclosure);
    const updated = await prisma.shopeeAffiliateSocialDraft.update({ where: { id: draftId }, data: { status: ShopeeAffiliateSocialDraftStatus.READY_FOR_REVIEW, reviewedAt: new Date() } });
    return this.safe(updated);
  }

  async archive(userId: string, draftId: string, reject = false) {
    const row = await prisma.shopeeAffiliateSocialDraft.findFirst({ where: { id: draftId, userId, deletedAt: null } });
    if (!row) throw new Error("DRAFT_NOT_FOUND");
    const updated = await prisma.shopeeAffiliateSocialDraft.update({ where: { id: draftId }, data: reject ? { status: ShopeeAffiliateSocialDraftStatus.REJECTED, archivedAt: new Date() } : { status: ShopeeAffiliateSocialDraftStatus.ARCHIVED, archivedAt: new Date() } });
    return this.safe(updated);
  }

  async softDelete(userId: string, draftId: string) {
    const updated = await prisma.shopeeAffiliateSocialDraft.updateMany({ where: { id: draftId, userId, deletedAt: null }, data: { deletedAt: new Date() } });
    return updated.count > 0;
  }

  private async createVersion(userId: string, draftId: string, version: number, content: string, editor: string) {
    await prisma.shopeeAffiliateSocialDraftVersion.create({ data: { userId, draftId, version, content, editor } });
  }

  sanitizeContent(content: string) {
    let sanitized = content.trim();
    for (const pattern of UNSAFE_PATTERNS) sanitized = sanitized.replace(pattern, "[removed-unsafe-claim]");
    return sanitized;
  }

  private ensureDisclosure(content: string, disclosure: string | null) {
    const base = disclosure?.trim();
    if (!base) throw new Error("DISCLOSURE_REQUIRED");
    if (!content.includes(base)) throw new Error("DISCLOSURE_REQUIRED");
  }

  private safe(row: { id: string; ingestionId: string; productId: string | null; affiliateLinkId: string | null; channel: ShopeeAffiliateSocialChannel; status: ShopeeAffiliateSocialDraftStatus; version: number; title: string | null; content: string; disclosure: string | null; hashtags: string | null; copiedAt: Date | null; reviewedAt: Date | null; archivedAt: Date | null; createdAt: Date; updatedAt: Date; }) {
    return { ...row, channel: fromDbChannel[row.channel], status: row.status.toLowerCase(), createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), copiedAt: row.copiedAt?.toISOString() ?? null, reviewedAt: row.reviewedAt?.toISOString() ?? null, archivedAt: row.archivedAt?.toISOString() ?? null };
  }
}

export const shopeeAffiliateSocialDraftService = new ShopeeAffiliateSocialDraftService();
