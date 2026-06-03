import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("shopee import progress panel static", () => {
  it("renders progress panel in shopee dashboard", () => {
    const dashboard = readFileSync("src/components/shopee/ShopeeAffiliateControlCenter.tsx", "utf8");
    expect(dashboard).toContain("CsvProductImportProgressPanel");
  });

  it("includes loading empty and action controls in panel", () => {
    const panel = readFileSync("src/components/imports/CsvProductImportProgressPanel.tsx", "utf8");
    expect(panel).toContain("กำลังโหลดสถานะการนำเข้า");
    expect(panel).toContain("ยังไม่มีงานนำเข้า CSV");
    expect(panel).toContain("runAction(job.id, \"cancel\")");
    expect(panel).toContain("runAction(job.id, \"retry\")");
    expect(panel).toContain("/api/imports/csv-products");
  });
});
