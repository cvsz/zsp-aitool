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

  it("rejects invalid aspect ratio", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const req = new Request("http://localhost/api/hyperframes/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "4:3", durationSeconds: 12, caption: "ok" }),
    });
    const response = await POST(req as never);
    expect(response.status).toBe(422);
  });

  it("enforces duration limit", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const req = new Request("http://localhost/api/hyperframes/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 300, caption: "ok" }),
    });
    const response = await POST(req as never);
    expect(response.status).toBe(422);
  });

  it("enforces caption length limit", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const req = new Request("http://localhost/api/hyperframes/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 12, caption: "a".repeat(1300) }),
    });
    const response = await POST(req as never);
    expect(response.status).toBe(422);
  });

  it("returns controlled validation error for unsafe media URL", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    vi.spyOn(productService, "getById").mockResolvedValue({
      id: "p1",
      title: "สินค้าทดสอบ",
      price: 199,
      currency: "THB",
      affiliateUrl: "https://example.com/aff",
      images: [{ url: "javascript:alert(1)" }],
    } as never);

    const req = new Request("http://localhost/api/hyperframes/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 12, caption: "<script>alert(1)</script>ลองเลย" }),
    });
    const response = await POST(req as never);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.ok).toBe(false);
  });

  it("blocks unsafe voiceover url", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    vi.spyOn(productService, "getById").mockResolvedValue({
      id: "p1",
      title: "สินค้าทดสอบ",
      price: 199,
      currency: "THB",
      affiliateUrl: null,
      images: [{ url: "https://example.com/p.jpg" }],
    } as never);

    const req = new Request("http://localhost/api/hyperframes/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 12, caption: "ลองเลย", voiceover: { source: "cached", mimeType: "audio/mpeg", sizeBytes: 1024, durationSeconds: 10, url: "http://unsafe.example.com/audio.mp3" } }),
    });
    const response = await POST(req as never);
    expect(response.status).toBe(422);
  });

  it("blocks oversized voiceover", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    const req = new Request("http://localhost/api/hyperframes/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 12, caption: "ลองเลย", voiceover: { source: "cached", mimeType: "audio/mpeg", sizeBytes: 30 * 1024 * 1024, durationSeconds: 10, url: "https://example.com/audio.mp3" } }),
    });
    const response = await POST(req as never);
    expect(response.status).toBe(422);
  });
});
