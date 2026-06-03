import { prisma } from "@/lib/prisma";
import { categoryMatchScore } from "@/lib/category-matcher";
import { extractKeywords, keywordOverlapScore } from "@/lib/keyword-extractor";
import { calculatePriceSimilarity } from "@/lib/price-similarity";

interface ProductRecord {
  id: string;
  userId: string;
  title: string;
  category?: string | null;
  description?: string | null;
  price: number;
  currency?: string;
}

export interface SimilarProductRecommendation {
  sourceProductId: string;
  relatedProductId: string;
  score: number;
  reasons: string[];
}

const WEIGHTS = {
  category: 0.35,
  title: 0.25,
  description: 0.2,
  price: 0.2
} as const;

function toProductRecord(p: { id: string; userId: string; title: string; category: string | null; description: string | null; price: { toNumber: () => number }; currency: string }): ProductRecord {
  return {
    id: p.id,
    userId: p.userId,
    title: p.title,
    category: p.category,
    description: p.description,
    price: p.price.toNumber(),
    currency: p.currency,
  };
}

export class SimilarProductService {
  async getRecommendations(productId: string, userId: string, forceRefresh = false): Promise<SimilarProductRecommendation[]> {
    const sourceRaw = await prisma.product.findFirst({ where: { id: productId, userId, deletedAt: null } });
    if (!sourceRaw) return [];
    const source = toProductRecord(sourceRaw);

    if (!forceRefresh) {
      const cached = await prisma.similarProduct.findMany({
        where: { sourceProductId: productId, sourceProduct: { userId } },
        orderBy: { score: "desc" },
        take: 12
      });
      if (cached.length > 0) {
        return cached.map((c) => ({
          sourceProductId: c.sourceProductId,
          relatedProductId: c.relatedProductId,
          score: c.score,
          reasons: c.reason ? c.reason.split(" | ") : [],
        }));
      }
    }

    const candidatesRaw = await prisma.product.findMany({
      where: { userId, deletedAt: null, id: { not: productId } },
      take: 100
    });
    const candidates = candidatesRaw.map(toProductRecord);

    if (candidates.length < 1) return [];

    const recommendations = candidates
      .map((candidate) => this.scorePair(source, candidate))
      .filter((item) => item.score >= 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    await prisma.similarProduct.deleteMany({ where: { sourceProductId: productId, sourceProduct: { userId } } });

    if (recommendations.length > 0) {
      await prisma.similarProduct.createMany({
        data: recommendations.map((item) => ({
          sourceProductId: item.sourceProductId,
          relatedProductId: item.relatedProductId,
          score: item.score,
          reason: item.reasons.join(" | "),
        }))
      });
    }

    return recommendations;
  }

  private scorePair(source: ProductRecord, target: ProductRecord): SimilarProductRecommendation {
    const category = categoryMatchScore(source.category, target.category);
    const title = keywordOverlapScore(extractKeywords(source.title), extractKeywords(target.title));
    const description = keywordOverlapScore(
      extractKeywords(source.description, { maxKeywords: 30 }),
      extractKeywords(target.description, { maxKeywords: 30 })
    );
    const price = calculatePriceSimilarity(source.price, target.price);

    const rawScore =
      category * WEIGHTS.category +
      title * WEIGHTS.title +
      description * WEIGHTS.description +
      price.normalizedScore * WEIGHTS.price;

    const score = Math.max(0, Math.min(100, Math.round(rawScore * 100)));
    const reasons: string[] = [];

    if (category > 0) reasons.push("อยู่ในหมวดหมู่ใกล้เคียงกัน");
    if (title >= 0.25) reasons.push("มีคำสำคัญในชื่อสินค้าซ้ำกัน");
    if (description >= 0.2) reasons.push("รายละเอียดสินค้ามีคำที่เกี่ยวข้องกัน");
    if (price.normalizedScore >= 0.6) reasons.push(`ราคาใกล้เคียงกัน (ต่างกันประมาณ ${price.deltaPercent}%)`);
    if (reasons.length === 0) reasons.push("คล้ายกันในภาพรวมของข้อมูลสินค้า");

    return {
      sourceProductId: source.id,
      relatedProductId: target.id,
      score,
      reasons
    };
  }
}
