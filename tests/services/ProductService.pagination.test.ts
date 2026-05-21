import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) }));
vi.mock("@/lib/prisma", () => ({ prisma: { product: { findMany: mocks.findMany, count: mocks.count } } }));

import { ProductService } from "@/services/ProductService";

describe("ProductService pagination", () => {
  it("caps page size and enforces user scoping", async () => {
    const svc = new ProductService();
    await svc.listProductsPaginated("u1", { page: 1, pageSize: 999 });
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100, where: expect.objectContaining({ userId: "u1", deletedAt: null }) }));
  });
});
