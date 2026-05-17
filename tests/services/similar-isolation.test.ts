import { describe, expect, it, vi } from "vitest";
import { SimilarProductService } from "@/services/SimilarProductService";

describe("SimilarProductService isolation", () => {
  it("denies cross-user access by returning source not found", async () => {
    const productDelegate = { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn() };
    const similarDelegate = { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() };
    const service = new SimilarProductService({ product: productDelegate, similarProduct: similarDelegate } as never);
    await expect(service.getRecommendations("p1", "user-b", false)).rejects.toThrow("Source product not found");
  });
});
