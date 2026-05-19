import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postScript } from "@/app/api/hyperframes/script/route";
import { POST as postToComposition } from "@/app/api/hyperframes/script-to-composition/route";

vi.mock("@/lib/auth", () => ({ getSessionFromRequest: vi.fn() }));
vi.mock("@/services/ProductService", () => ({ productService: { getById: vi.fn() } }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameScriptGeneration: { create: vi.fn(async (x: unknown) => x) },
    hyperFrameRenderJob: { create: vi.fn(async (x: unknown) => x) },
  },
}));

const { getSessionFromRequest } = await import("@/lib/auth");
const { productService } = await import("@/services/ProductService");
const { prisma } = await import("@/lib/prisma");

describe("hyperframes script api", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated 401", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const res = await postScript(new NextRequest("http://localhost/api/hyperframes/script", { method: "POST", body: "{}" }) as never);
    expect(res.status).toBe(401);
  });

  it("cross-user product blocked", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(productService.getById).mockRejectedValueOnce(new Error("Product not found"));
    const res = await postScript(new NextRequest("http://localhost/api/hyperframes/script", { method: "POST", body: JSON.stringify({ productId: "p2", platform: "tiktok", tone: "friendly", language: "th", durationSeconds: 15, aspectRatio: "9:16" }) }) as never);
    expect(res.status).toBe(400);
  });

  it("affiliate disclosure included and persists", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(productService.getById).mockResolvedValueOnce({ id: "p1", title: "Lamp", description: "Good", price: 100, currency: "THB", category: null, shopName: null, affiliateUrl: "https://aff", images: [] } as never);
    const res = await postScript(new NextRequest("http://localhost/api/hyperframes/script", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "tiktok", tone: "friendly", language: "th", durationSeconds: 15, aspectRatio: "9:16" }) }) as never);
    const body = await res.json();
    expect(body.data.disclosure).toBeTruthy();
    expect(body.data.beats.map((b: { type: string }) => b.type)).toEqual(["hook", "problem", "productDemo", "benefits", "CTA", "disclosure"]);
  });

  it("language respected (en)", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(productService.getById).mockResolvedValueOnce({ id: "p1", title: "Lamp", description: "Good", price: 100, currency: "THB", category: null, shopName: null, affiliateUrl: "https://aff", images: [] } as never);
    const res = await postScript(new NextRequest("http://localhost/api/hyperframes/script", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "facebook", tone: "friendly", language: "en", durationSeconds: 18, aspectRatio: "9:16" }) }) as never);
    const body = await res.json();
    expect(body.data.script).toContain("Looking for");
  });

  it("no render job auto-created", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(productService.getById).mockResolvedValueOnce({ id: "p1", title: "Lamp", description: "Good", price: 100, currency: "THB", category: null, shopName: null, affiliateUrl: "https://aff", images: [] } as never);
    await postScript(new NextRequest("http://localhost/api/hyperframes/script", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "tiktok", tone: "friendly", language: "th", durationSeconds: 15, aspectRatio: "9:16" }) }) as never);
    expect(prisma.hyperFrameRenderJob.create).not.toHaveBeenCalled();
  });

  it("fake claims blocked", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(productService.getById).mockResolvedValueOnce({ id: "p1", title: "Lamp", description: "guaranteed 100%", price: 100, currency: "THB", category: null, shopName: null, affiliateUrl: "https://aff", images: [] } as never);
    const res = await postScript(new NextRequest("http://localhost/api/hyperframes/script", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "tiktok", tone: "friendly", language: "en", durationSeconds: 15, aspectRatio: "9:16" }) }) as never);
    expect(res.status).toBe(400);
  });

  it("composition metadata safe + no render", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(productService.getById).mockResolvedValueOnce({ id: "p1" } as never);
    const res = await postToComposition(new NextRequest("http://localhost/api/hyperframes/script-to-composition", { method: "POST", body: JSON.stringify({ productId: "p1", aspectRatio: "9:16", durationSeconds: 15, beats: [{ atSecond: 0, text: "<script>x</script>safe" }, { atSecond: 6, text: "b" }, { atSecond: 6, text: "a" }] }) }) as never);
    const body = await res.json();
    expect(body.data.renderTriggered).toBe(false);
    expect(body.data.scenes[0].text).not.toContain("<script>");
    expect(body.data.scenes[0].text).toContain("&lt;script&gt;");
    expect(body.data.scenes.map((x: { text: string }) => x.text)).toEqual(["&lt;script&gt;x&lt;/script&gt;safe", "a", "b"]);
  });

  it("html-like beat text is escaped", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(productService.getById).mockResolvedValueOnce({ id: "p1" } as never);
    const res = await postToComposition(new NextRequest("http://localhost/api/hyperframes/script-to-composition", { method: "POST", body: JSON.stringify({ productId: "p1", aspectRatio: "9:16", durationSeconds: 15, beats: [{ atSecond: 0, text: "<script>alert(1)</script>" }] }) }) as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.scenes[0].text).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("composition cross-user blocked", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(productService.getById).mockRejectedValueOnce(new Error("Product not found"));
    const res = await postToComposition(new NextRequest("http://localhost/api/hyperframes/script-to-composition", { method: "POST", body: JSON.stringify({ productId: "p2", aspectRatio: "9:16", durationSeconds: 15, beats: [{ atSecond: 0, text: "safe" }] }) }) as never);
    expect(res.status).toBe(400);
  });
});
