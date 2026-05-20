import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Shopee affiliate runbook safety copy", () => {
  it("contains compliance-safe instructions", () => {
    const text = fs.readFileSync(path.join(process.cwd(), "docs/runbooks/shopee-affiliate-portal-integration.md"), "utf8");
    expect(text).toContain("ไม่เก็บรหัสผ่าน Shopee");
    expect(text).toContain("ไม่เก็บ cookies");
    expect(text).toContain("ไม่ scrape หน้า private dashboard");
    expect(text).toContain("ไม่ใช่ Shopee Open API OAuth");
    expect(text).not.toMatch(/การันตีรายได้|guaranteed income/i);
    expect(text).not.toMatch(/fake review/i);
  });
});
