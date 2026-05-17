import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    product: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    productImage: { updateMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { AppError } from "@/lib/errors";
import { ProductService } from "@/services/ProductService";

describe("ProductService hardening", () => {
  const service = new ProductService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns controlled duplicate error for normalized originalUrl", async () => {
    prismaMock.product.findFirst.mockResolvedValueOnce({ id: "dup-1" });

    await expect(service.create("u1", { title: "X", price: 100, currency: "THB", originalUrl: "https://EXAMPLE.com/item/1/?utm_source=xx", images: [] })).rejects.toMatchObject<AppError>({ code: "DUPLICATE_PRODUCT_URL", status: 409 });
  });
});
