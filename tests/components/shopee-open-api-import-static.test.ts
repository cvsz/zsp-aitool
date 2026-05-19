import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Shopee Open API import copy", () => {
  it("mentions optional disabled-by-default official API and avoids bypass/scraping claims", () => {
    const filePath = path.join(process.cwd(), "src/components/products/ProductImportForm.tsx");
    const text = fs.readFileSync(filePath, "utf8");
    expect(text).toMatch(/Shopee Open API \(official\)/);
    expect(text).toMatch(/ปิดไว้เป็นค่าเริ่มต้น/);
    expect(text).toMatch(/ไม่รองรับการดึงข้อมูลแบบ scraping/);
    expect(text).toMatch(/Managed Seller \/ Mall Seller \/ KAM/);
    expect(text).toMatch(/affiliate disclosure/);
  });

  it("never mentions storing seller passwords", () => {
    const filePath = path.join(process.cwd(), "docs/runbooks/shopee-open-api-managed-seller-kam.md");
    const text = fs.readFileSync(filePath, "utf8");
    expect(text).toMatch(/Do not:[\s\S]*store seller passwords/);
  });
});
