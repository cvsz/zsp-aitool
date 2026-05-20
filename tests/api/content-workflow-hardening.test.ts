import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST as aiGeneratePost } from "@/app/api/ai/generate/route";
import { POST as aiGenerateBatchPost } from "@/app/api/ai/generate-batch/route";
import { GET as historyGet } from "@/app/api/content-history/route";
import { GET as historyItemGet, DELETE as historyItemDelete } from "@/app/api/content-history/[id]/route";
import { GET as productsCsvGet } from "@/app/api/export/products.csv/route";
import { GET as contentCsvGet } from "@/app/api/export/content.csv/route";
import { GET as contentMdGet } from "@/app/api/export/content.md/route";
import { GET as contentTxtGet } from "@/app/api/export/content/[id].txt/route";
import { getSessionFromRequest } from "@/lib/auth";
import { productService } from "@/services/ProductService";
import { ExportService } from "@/services/ExportService";
import { AppError } from "@/lib/errors";
import { AIContentService } from "@/services/AIContentService";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getSessionFromRequest: vi.fn() };
});
vi.mock("@/lib/prisma", () => ({ prisma: { contentGeneration: { findMany: vi.fn(async (args: any) => [{ id: "cg1", userId: args.where.userId }]), findFirst: vi.fn(async (args: any) => args.where.userId === "owner" ? { id: "cg1", userId: "owner" } : null), updateMany: vi.fn(async (args: any) => ({ count: args.where.userId === "owner" ? 1 : 0 })) } } }));
vi.mock("@/services/ProductService", () => ({ productService: { getById: vi.fn(async (userId: string, id: string) => { if (userId === "owner" && id === "p1") return { id: "p1", title: "P", price: 10, currency: "THB", affiliateUrl: "https://aff" }; throw new AppError("NOT_FOUND", "Product not found", 404); }) } }));
vi.mock("@/services/BudgetService", () => ({
  BudgetService: {
    checkBudget: vi.fn().mockResolvedValue(undefined),
    logUsage: vi.fn().mockResolvedValue(undefined),
    getDailyUsage: vi.fn().mockResolvedValue(0),
  },
}));

const mockedAuth = vi.mocked(getSessionFromRequest);

describe("content workflow hardening", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated AI generate returns 401", async () => {
    mockedAuth.mockReturnValueOnce(null);
    const res = await aiGeneratePost(new NextRequest("http://localhost/api/ai/generate", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "facebook", tone: "friendly", language: "th", versions: 1 }) }));
    expect(res.status).toBe(401);
  });

  it("AI generate for own product succeeds", async () => {
    vi.spyOn(AIContentService.prototype, "generate").mockResolvedValueOnce([{ platform: "facebook", headline: "", caption: "ok", hashtags: [], cta: "", affiliateDisclosure: "", warnings: [] }]);
    vi.spyOn(AIContentService.prototype, "saveGenerationHistory").mockResolvedValueOnce(undefined);
    mockedAuth.mockReturnValueOnce({ userId: "owner", email: "o@o.com", exp: 1 });
    const res = await aiGeneratePost(new NextRequest("http://localhost/api/ai/generate", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "facebook", tone: "friendly", language: "th", versions: 1 }) }));
    expect(res.status).toBe(200);
  });

  it("AI generate blocks another user's product", async () => {
    mockedAuth.mockReturnValueOnce({ userId: "attacker", email: "a@a.com", exp: 1 });
    const res = await aiGeneratePost(new NextRequest("http://localhost/api/ai/generate", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "facebook", tone: "friendly", language: "th", versions: 1 }) }));
    expect(res.status).toBe(404);
  });

  it("batch generation reports cross-user safely", async () => {
    mockedAuth.mockReturnValueOnce({ userId: "owner", email: "o@o.com", exp: 1 });
    const res = await aiGenerateBatchPost(new NextRequest("http://localhost/api/ai/generate-batch", { method: "POST", body: JSON.stringify({ productIds: ["p1", "forbidden"], platforms: ["facebook"], tone: "friendly", language: "th", versions: 1 }) }));
    expect(res.status).toBe(207);
    const body = await res.json();
    expect(body.data.some((x: any) => x.productId === "forbidden" && x.ok === false)).toBe(true);
  });

  it("content history read/delete blocks cross-user", async () => {
    mockedAuth.mockReturnValueOnce({ userId: "attacker", email: "a@a.com", exp: 1 }).mockReturnValueOnce({ userId: "attacker", email: "a@a.com", exp: 1 });
    const getRes = await historyItemGet(new NextRequest("http://localhost/api/content-history/cg1"), { params: Promise.resolve({ id: "cg1" }) });
    const delRes = await historyItemDelete(new NextRequest("http://localhost/api/content-history/cg1", { method: "DELETE" }), { params: Promise.resolve({ id: "cg1" }) });
    expect(getRes.status).toBe(404);
    expect(delRes.status).toBe(404);
  });
});

describe("export scoping", () => {
  it("routes pass authenticated user scope", async () => {
    const p = vi.spyOn(ExportService.prototype, "exportProductsCsv").mockResolvedValue("id\n");
    const c = vi.spyOn(ExportService.prototype, "exportContentCsv").mockResolvedValue("id\n");
    const m = vi.spyOn(ExportService.prototype, "exportContentMarkdown").mockResolvedValue("# x");
    const t = vi.spyOn(ExportService.prototype, "exportSingleContentTxt").mockResolvedValue(null);
    mockedAuth.mockReturnValue({ userId: "owner", email: "o@o.com", exp: 1 });
    await productsCsvGet(new NextRequest("http://localhost/api/export/products.csv"));
    await contentCsvGet(new NextRequest("http://localhost/api/export/content.csv"));
    await contentMdGet(new NextRequest("http://localhost/api/export/content.md"));
    const txt = await contentTxtGet(new NextRequest("http://localhost/api/export/content/cg1.txt"), { params: Promise.resolve({ id: "cg1" }) });
    expect(p).toHaveBeenCalledWith("owner");
    expect(c).toHaveBeenCalledWith("owner", expect.any(Object));
    expect(m).toHaveBeenCalledWith("owner", expect.any(Object));
    expect(t).toHaveBeenCalledWith("owner", "cg1");
    expect(txt.status).toBe(404);
  });
});
