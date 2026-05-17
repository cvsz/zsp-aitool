import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET as productsGet } from "@/app/api/products/route";
import { POST as aiGeneratePost } from "@/app/api/ai/generate/route";

vi.mock("@/services/ProductService", () => ({
  productService: {
    list: vi.fn(async () => []),
    getById: vi.fn(async (userId: string, id: string) => {
      if (userId === "owner" && id === "p1") return { id: "p1", title: "P", price: 10, currency: "THB" };
      throw new Error("Product not found");
    }),
  },
}));

describe("tenant isolation api", () => {
  it("unauthenticated product API request returns 401", async () => {
    const req = new NextRequest("http://localhost/api/products");
    const res = await productsGet(req);
    expect(res.status).toBe(401);
  });

  it("unauthenticated content generation request returns 401", async () => {
    const req = new NextRequest("http://localhost/api/ai/generate", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "facebook", tone: "friendly", language: "th", versions: 1 }) });
    const res = await aiGeneratePost(req);
    expect(res.status).toBe(401);
  });
});
