import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST as importUrlPost } from "@/app/api/products/import-url/route";
import { POST as extensionImportPost } from "@/app/api/products/extension-import/route";
import { getSessionFromRequest } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { productService } from "@/services/ProductService";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getSessionFromRequest: vi.fn(() => null) };
});

vi.mock("@/services/ProductService", () => ({
  productService: {
    importByUrl: vi.fn(),
    importFromExtension: vi.fn(),
  },
}));

describe("product import routes", () => {
  it("returns 401 for unauthenticated import-url", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const request = new NextRequest("http://localhost/api/products/import-url", {
      method: "POST",
      body: JSON.stringify({ originalUrl: "https://example.com" }),
      headers: { "content-type": "application/json" },
    });

    const response = await importUrlPost(request);
    expect(response.status).toBe(401);
  });

  it("returns validation error when title is missing in extension payload", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u1@example.com" });
    const request = new NextRequest("http://localhost/api/products/extension-import", {
      method: "POST",
      body: JSON.stringify({ payload: { originalUrl: "https://example.com", visibleDataOnly: true } }),
      headers: { "content-type": "application/json" },
    });

    const response = await extensionImportPost(request);
    expect(response.status).toBe(422);
  });

  it("does not trust extension payload userId", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "auth-user", email: "u1@example.com" });
    vi.mocked(productService.importFromExtension).mockResolvedValueOnce({ id: "p1" } as never);

    const request = new NextRequest("http://localhost/api/products/extension-import", {
      method: "POST",
      body: JSON.stringify({
        payload: {
          userId: "attacker-user",
          title: "Product A",
          originalUrl: "https://example.com/item",
          visibleDataOnly: true,
          images: ["https://example.com/a.jpg"],
        },
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await extensionImportPost(request);
    expect(response.status).toBe(201);
    expect(productService.importFromExtension).toHaveBeenCalledWith("auth-user", expect.any(Object));
  });

  it("returns controlled 409 for duplicate product URL", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u1@example.com" });
    vi.mocked(productService.importByUrl).mockRejectedValueOnce(new AppError("DUPLICATE_PRODUCT_URL", "Product URL already exists for this user", 409));

    const request = new NextRequest("http://localhost/api/products/import-url", {
      method: "POST",
      body: JSON.stringify({ originalUrl: "https://example.com/item" }),
      headers: { "content-type": "application/json" },
    });

    const response = await importUrlPost(request);
    expect(response.status).toBe(409);
  });
});
