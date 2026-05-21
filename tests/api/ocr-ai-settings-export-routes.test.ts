import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST as ocrPost } from "@/app/api/ocr/extract/route";
import { POST as genPost } from "@/app/api/ai/generate/route";
import { POST as batchPost } from "@/app/api/ai/generate-batch/route";
import { GET as settingsGet, PUT as settingsPut } from "@/app/api/settings/route";
import { GET as contentCsvGet } from "@/app/api/export/content.csv/route";
import { GET as productsCsvGet } from "@/app/api/export/products.csv/route";
import { GET as contentMdGet } from "@/app/api/export/content.md/route";
import { GET as contentTxtGet } from "@/app/api/export/content/[id].txt/route";

vi.mock("@/lib/auth", async () => ({ ...(await vi.importActual("@/lib/auth")), getSessionFromRequest: vi.fn(() => null) }));

describe("ocr/ai/settings/export routes", () => {
  it("require authentication", async () => {
    const postReq = new NextRequest("http://localhost", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
    expect((await ocrPost(postReq)).status).toBe(401);
    expect((await genPost(postReq)).status).toBe(401);
    expect((await batchPost(postReq)).status).toBe(401);
    expect((await settingsGet(new NextRequest("http://localhost/api/settings"))).status).toBe(401);
    expect((await settingsPut(postReq)).status).toBe(401);
    expect((await contentCsvGet(new NextRequest("http://localhost/api/export/content.csv"))).status).toBe(401);
    expect((await productsCsvGet(new NextRequest("http://localhost/api/export/products.csv"))).status).toBe(401);
    expect((await contentMdGet(new NextRequest("http://localhost/api/export/content.md"))).status).toBe(401);
    expect((await contentTxtGet(new NextRequest("http://localhost/api/export/content/1.txt"), { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
