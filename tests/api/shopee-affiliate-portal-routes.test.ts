import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as manualImportPost } from "@/app/api/integrations/shopee/affiliate-manual-import/route";
import { POST as csvPreviewPost } from "@/app/api/integrations/shopee/affiliate-csv-preview/route";
import { getSessionFromRequest } from "@/lib/auth";

vi.mock("@/lib/auth", async () => ({ ...(await vi.importActual("@/lib/auth")), getSessionFromRequest: vi.fn(() => null) }));

describe("shopee affiliate portal routes", () => {
  it("requires auth for manual import", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const res = await manualImportPost(new NextRequest("http://localhost/api/integrations/shopee/affiliate-manual-import", { method: "POST", body: JSON.stringify({}) }));
    expect(res.status).toBe(401);
  });

  it("blocks non-shopee urls", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u1@x.com" });
    const res = await manualImportPost(new NextRequest("http://localhost/api/integrations/shopee/affiliate-manual-import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ affiliateUrl: "https://evil.com", productUrl: "https://shopee.co.th/a", saveMode: "affiliate-link" }) }));
    expect(res.status).toBe(422);
  });

  it("blocks csv formula injection", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u1@x.com" });
    const res = await csvPreviewPost(new NextRequest("http://localhost/api/integrations/shopee/affiliate-csv-preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ csv: "name,price\n=HYPERLINK(\"bad\"),10" }) }));
    expect(res.status).toBe(422);
  });
});
