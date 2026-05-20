import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Shopee affiliate portal static copy", () => {
  it("keeps manual-safe mode and open api separation", () => {
    const text = fs.readFileSync(path.join(process.cwd(), "src/components/settings/SettingsForm.tsx"), "utf8");
    expect(text).toContain("Manual Safe Mode");
    expect(text).toContain("https://affiliate.shopee.co.th/");
    expect(text).toContain("ไม่เชื่อม Open API OAuth");
    expect(text).toContain("ไม่เก็บรหัสผ่าน/cookies/session/localStorage");
  });
});
