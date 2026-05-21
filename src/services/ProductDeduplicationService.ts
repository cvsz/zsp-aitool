import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

type ProductLite = {
  id: string; userId: string; title: string; price: Prisma.Decimal; originalUrl: string; affiliateUrl: string | null; shopName: string | null; category: string | null; rawMetadata: Prisma.JsonValue | null; createdAt: Date; updatedAt: Date;
};

export class ProductDeduplicationService {
  normalizeUrl(input: string): string {
    try {
      const url = new URL(input.trim());
      url.hash = "";
      for (const key of ["utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid", "si"]) url.searchParams.delete(key);
      url.host = url.host.toLowerCase();
      url.pathname = url.pathname.replace(/\/$/, "");
      return url.toString();
    } catch { return input.trim(); }
  }

  extractShopeeItemId(input: string): string | null {
    const m = input.match(/(?:-i\.(\d+)\.(\d+)|itemid=(\d+)|product\/(\d+))/i);
    return m?.[2] ?? m?.[3] ?? m?.[4] ?? null;
  }

  private normalizeText(input: string | null | undefined): string { return (input ?? "").trim().toLowerCase().replace(/\s+/g, " "); }

  private score(a: ProductLite, b: ProductLite) {
    const reasons: string[] = [];
    let score = 0;
    const urlA = this.normalizeUrl(a.originalUrl); const urlB = this.normalizeUrl(b.originalUrl);
    if (urlA === urlB) { score += 60; reasons.push("originalUrl_match"); }
    const idA = this.extractShopeeItemId(`${a.originalUrl} ${(a.rawMetadata as Record<string, unknown> | null)?.productIdRaw ?? ""}`);
    const idB = this.extractShopeeItemId(`${b.originalUrl} ${(b.rawMetadata as Record<string, unknown> | null)?.productIdRaw ?? ""}`);
    if (idA && idA === idB) { score += 50; reasons.push("shopee_item_id_match"); }
    if (this.normalizeUrl(a.affiliateUrl ?? "") && this.normalizeUrl(a.affiliateUrl ?? "") === this.normalizeUrl(b.affiliateUrl ?? "")) { score += 25; reasons.push("affiliate_url_match"); }
    if (this.normalizeText(a.shopName) && this.normalizeText(a.shopName) === this.normalizeText(b.shopName) && this.normalizeText(a.category) === this.normalizeText(b.category) && this.normalizeText(a.title) === this.normalizeText(b.title)) {
      score += 35; reasons.push("shop_title_category_match");
    }
    return { score, reasons };
  }

  async scan(userId: string, limit = 200) {
    const products = await prisma.product.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: Math.min(Math.max(limit, 10), 500) });
    const groups: { productIds: string[]; score: number; reason: string[] }[] = [];
    const consumed = new Set<string>();
    for (let i = 0; i < products.length; i++) {
      if (consumed.has(products[i].id)) continue;
      const group = [products[i].id]; let maxScore = 0; const reasons = new Set<string>();
      for (let j = i + 1; j < products.length; j++) {
        if (consumed.has(products[j].id)) continue;
        const s = this.score(products[i] as ProductLite, products[j] as ProductLite);
        if (s.score >= 50) { group.push(products[j].id); maxScore = Math.max(maxScore, s.score); s.reasons.forEach((x) => reasons.add(x)); consumed.add(products[j].id); }
      }
      if (group.length > 1) groups.push({ productIds: group, score: maxScore, reason: [...reasons] });
    }

    await prisma.productDuplicateGroup.updateMany({ where: { userId, status: "PENDING_REVIEW" }, data: { status: "SUPERSEDED" } });
    await prisma.$transaction(groups.map((g) => prisma.productDuplicateGroup.create({ data: { userId, productIds: g.productIds, score: new Prisma.Decimal((g.score/100*99).toFixed(2)), reason: { signals: g.reason }, status: "PENDING_REVIEW" } })));
    return { createdGroups: groups.length };
  }

  async listGroups(userId: string) { return prisma.productDuplicateGroup.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } }); }

  async dismiss(userId: string, groupId: string) {
    const group = await prisma.productDuplicateGroup.findFirst({ where: { id: groupId, userId, deletedAt: null } });
    if (!group) throw new AppError("NOT_FOUND", "Duplicate group not found", 404);
    return prisma.productDuplicateGroup.update({ where: { id: groupId }, data: { status: "DISMISSED", reviewedAt: new Date() } });
  }

  async mergeGroup(userId: string, groupId: string, canonicalProductId: string) {
    const group = await prisma.productDuplicateGroup.findFirst({ where: { id: groupId, userId, deletedAt: null } });
    if (!group) throw new AppError("NOT_FOUND", "Duplicate group not found", 404);
    if (group.status === "MERGED") return group;
    if (!group.productIds.includes(canonicalProductId)) throw new AppError("VALIDATION_ERROR", "Canonical product must be in group", 422);
    const dupIds = group.productIds.filter((id) => id !== canonicalProductId);
    await prisma.$transaction(async (tx) => {
      const canonical = await tx.product.findFirst({ where: { id: canonicalProductId, userId, deletedAt: null } });
      if (!canonical) throw new AppError("NOT_FOUND", "Canonical product not found", 404);
      const dups = await tx.product.findMany({ where: { id: { in: dupIds }, userId, deletedAt: null } });
      for (const dup of dups) {
        await tx.affiliateLink.updateMany({ where: { productId: dup.id, userId }, data: { productId: canonicalProductId } });
        await tx.contentGeneration.updateMany({ where: { productId: dup.id, userId }, data: { productId: canonicalProductId } });
        await tx.platformPost.updateMany({ where: { productId: dup.id, userId }, data: { productId: canonicalProductId } });
        await tx.oCRJob.updateMany({ where: { productId: dup.id, userId }, data: { productId: canonicalProductId } });
        await tx.hyperFrameRenderJob.updateMany({ where: { productId: dup.id, userId }, data: { productId: canonicalProductId } });
        await tx.shopeeAffiliateIngestion.updateMany({ where: { productId: dup.id, userId }, data: { productId: canonicalProductId } });
        await tx.shopeeAffiliateSocialDraft.updateMany({ where: { productId: dup.id, userId }, data: { productId: canonicalProductId } });
        await tx.product.update({ where: { id: dup.id }, data: { deletedAt: new Date(), rawMetadata: { ...(dup.rawMetadata as Record<string, unknown> ?? {}), dedupeMergedInto: canonicalProductId } } });
      }
      await tx.productDuplicateGroup.update({ where: { id: groupId }, data: { status: "MERGED", canonicalProductId, mergedAt: new Date(), reviewedAt: new Date() } });
    });
    return prisma.productDuplicateGroup.findUnique({ where: { id: groupId } });
  }
}

export const productDeduplicationService = new ProductDeduplicationService();
