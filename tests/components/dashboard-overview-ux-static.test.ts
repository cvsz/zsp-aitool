import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(path.join(process.cwd(), "src/app/dashboard/page.tsx"), "utf8");
const mobileNav = readFileSync(path.join(process.cwd(), "src/components/layout/MobileNav.tsx"), "utf8");

describe("dashboard overview ux static", () => {
  it("contains Thai-first hero and compliance-safe copy", () => {
    ["ศูนย์ควบคุม ZSP Affiliate", "Compliance Notice", "Affiliate Disclosure"].forEach((label) => {
      expect(dashboard).toContain(label);
    });
  });

  it("contains required quick actions", () => {
    ["เพิ่มสินค้า", "สร้างคอนเทนต์ AI", "เปิด OCR", "เปิด HyperFrames Studio", "ดูประวัติเรนเดอร์", "จัดการ Prompt Templates"].forEach((label) => {
      expect(dashboard).toContain(label);
    });
  });

  it("does not render raw JSON or sensitive markers", () => {
    ["JSON.stringify", "<pre", "outputPath", "/var/lib", "DATABASE_URL", "dangerouslySetInnerHTML"].forEach((token) => {
      expect(dashboard).not.toContain(token);
    });
  });

  it("keeps mobile nav present", () => {
    expect(mobileNav).toContain("เมนูหลักบนมือถือ");
    expect(mobileNav).toContain("/dashboard/hyperframes/renders");
  });
});
