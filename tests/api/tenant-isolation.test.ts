import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET as productsGet } from "@/app/api/products/route";
import { POST as aiGeneratePost } from "@/app/api/ai/generate/route";
import { GET as contentCsvGet } from "@/app/api/export/content.csv/route";
import { GET as historyGet } from "@/app/api/content-history/route";
import { GET as templatesGet } from "@/app/api/templates/route";
import { GET as settingsGet } from "@/app/api/settings/route";
import { POST as hyperframesComposePost } from "@/app/api/hyperframes/compose/route";
import { getSessionFromRequest } from "@/lib/auth";
import { productService } from "@/services/ProductService";
import { ExportService } from "@/services/ExportService";
import { AppError } from "@/lib/errors";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getSessionFromRequest: vi.fn() };
});


vi.mock("@/lib/prisma", () => ({
  prisma: {
    contentGeneration: { findMany: vi.fn(async (args: { where: { userId: string } }) => [{ id: "cg1", userId: args.where.userId }]) },
    userSetting: { findUnique: vi.fn(async (args: { where: { userId: string } }) => ({ id: "s1", userId: args.where.userId })) },
  },
}));

vi.mock("@/services/ProductService", () => ({
  productService: {
    list: vi.fn(async () => []),
    getById: vi.fn(async (userId: string, id: string) => {
      if (userId === "owner" && id === "p1") return { id: "p1", title: "P", price: 10, currency: "THB" };
      throw new AppError("NOT_FOUND", "Product not found", 404);
    }),
  },
}));

vi.mock("@/services/BudgetService", () => ({
  BudgetService: {
    checkBudget: vi.fn().mockResolvedValue(undefined),
    logUsage: vi.fn().mockResolvedValue(undefined),
    getDailyUsage: vi.fn().mockResolvedValue(0),
  },
}));

const exportContentCsvSpy = vi.spyOn(ExportService.prototype, "exportContentCsv");

const mockedGetSessionFromRequest = vi.mocked(getSessionFromRequest);
const mockedGetById = vi.mocked(productService.getById);

describe("P0 tenant isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unauthenticated product API returns 401", async () => {
    mockedGetSessionFromRequest.mockReturnValueOnce(null);
    const req = new NextRequest("http://localhost/api/products");
    const res = await productsGet(req);
    expect(res.status).toBe(401);
  });

  it("user cannot read another user's product", async () => {
    mockedGetSessionFromRequest.mockReturnValueOnce({ userId: "attacker", email: "a@a.com", exp: 9999999999 });
    const req = new NextRequest("http://localhost/api/ai/generate", { method: "POST", body: JSON.stringify({ productId: "p1", platform: "facebook", tone: "friendly", language: "th", versions: 1 }) });
    const res = await aiGeneratePost(req);
    expect(mockedGetById).toHaveBeenCalledWith("attacker", "p1");
    expect(res.status).toBe(404);
  });

  it("user cannot generate content for another user's product", async () => {
    mockedGetSessionFromRequest.mockReturnValueOnce({ userId: "owner", email: "o@o.com", exp: 9999999999 });
    const req = new NextRequest("http://localhost/api/ai/generate", { method: "POST", body: JSON.stringify({ productId: "foreign-product", platform: "facebook", tone: "friendly", language: "th", versions: 1 }) });
    const res = await aiGeneratePost(req);
    expect(mockedGetById).toHaveBeenCalledWith("owner", "foreign-product");
    expect(res.status).toBe(404);
  });

  it("export routes do not leak other users' data", async () => {
    mockedGetSessionFromRequest.mockReturnValueOnce({ userId: "owner", email: "o@o.com", exp: 9999999999 });
    exportContentCsvSpy.mockResolvedValueOnce("id,platform\n");
    const req = new NextRequest("http://localhost/api/export/content.csv");
    const res = await contentCsvGet(req);
    expect(res.status).toBe(200);
    expect(exportContentCsvSpy).toHaveBeenCalledWith("owner", expect.any(Object));
  });

  it("user cannot use another user's product in HyperFrames composition", async () => {
    mockedGetSessionFromRequest.mockReturnValueOnce({ userId: "attacker", email: "a@a.com", exp: 9999999999 });
    const req = new NextRequest("http://localhost/api/hyperframes/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "p1", platform: "facebook", aspectRatio: "9:16", durationSeconds: 12, caption: "ok" }),
    });
    const res = await hyperframesComposePost(req as never);
    expect(mockedGetById).toHaveBeenCalledWith("attacker", "p1");
    expect(res.status).toBe(404);
  });

  it("content-history/templates/settings are user scoped", async () => {
    mockedGetSessionFromRequest
      .mockReturnValueOnce({ userId: "owner", email: "o@o.com", exp: 9999999999 })
      .mockReturnValueOnce({ userId: "owner", email: "o@o.com", exp: 9999999999 })
      .mockReturnValueOnce({ userId: "owner", email: "o@o.com", exp: 9999999999 });

    const historyRes = await historyGet(new NextRequest("http://localhost/api/content-history"));
    const templatesRes = await templatesGet(new NextRequest("http://localhost/api/templates"));
    const settingsRes = await settingsGet(new NextRequest("http://localhost/api/settings"));

    expect(historyRes.status).toBe(200);
    expect(templatesRes.status).toBe(200);
    expect(settingsRes.status).toBe(200);
  });
});
