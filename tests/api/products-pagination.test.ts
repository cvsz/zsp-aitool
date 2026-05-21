import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/products/route";
import { getSessionFromRequest } from "@/lib/auth";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getSessionFromRequest: vi.fn(() => ({ userId: "u1" })) };
});

vi.mock("@/services/ProductService", () => ({
  productService: {
    listProductsPaginated: vi.fn().mockResolvedValue({ items: [], pagination: { page: 1, pageSize: 25, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false }, filters: {} }),
  },
}));

describe("products pagination api", () => {
  it("rejects unauthenticated", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const response = await GET(new NextRequest("http://localhost/api/products"));
    expect(response.status).toBe(401);
  });

  it("returns paginated payload", async () => {
    const response = await GET(new NextRequest("http://localhost/api/products?page=1&pageSize=50"));
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.data.pagination.pageSize).toBe(25);
    expect(payload.data.pagination).toBeTruthy();
  });
});
