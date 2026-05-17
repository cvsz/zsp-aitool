import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/hyperframes/compose/route";
import * as auth from "@/lib/auth";
import { productService } from "@/services/ProductService";

describe("hyperframes compose", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const req = new Request("http://localhost/api/hyperframes/compose", { method: "POST", body: JSON.stringify({}) });
    const response = await POST(req as never);
    expect(response.status).toBe(401);
  });

  it("includes product title and disclosure", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    vi.spyOn(productService, "getById").mockResolvedValue({ id: "p1", title: "สินค้าทดสอบ", price: 199, currency: "THB", affiliateUrl: "https://example.com/aff", images: [{ url: "https://example.com/p.jpg" }] } as never);
    const req = new Request("http://localhost/api/hyperframes/compose", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 12, caption: "<script>alert(1)</script>ลองเลย" }) });
    const response = await POST(req as never);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.compositionHtml).toContain("สินค้าทดสอบ");
    expect(body.data.compositionHtml).toContain("แอฟฟิลิเอต");
    expect(body.data.compositionHtml).not.toContain("<script>alert(1)</script>");
  });

  it("rejects invalid aspect ratio", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const req = new Request("http://localhost/api/hyperframes/compose", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "4:3", durationSeconds: 12, caption: "ok" }) });
    const response = await POST(req as never);
    expect(response.status).toBe(422);
  });
});
