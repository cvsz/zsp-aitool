import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("shopee open api import static copy", () => {
  it("keeps official optional copy and no bypass enablement", () => {
    const content = readFileSync("src/components/products/ProductImportForm.tsx", "utf8");
    expect(content).toMatch(/Shopee Open API/);
    expect(content).toMatch(/ปิดไว้โดยค่าเริ่มต้น/);
    expect(content).toMatch(/ต้องตรวจทาน\/แก้ไขข้อมูลก่อนบันทึกทุกครั้ง/);
    expect(content).toMatch(/ไม่สนับสนุนการ bypass CAPTCHA/);
    expect(content).not.toMatch(/รองรับ.*(captcha bypass|anti-bot bypass|private endpoint|mass scraping)/i);
    expect(content).not.toMatch(/seller password|seller_password/i);
  });
});
