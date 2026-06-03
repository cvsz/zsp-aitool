import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("branding", () => {
  it("does not include deprecated product branding in product code paths", 30000, () => {
    const output = execSync('grep -RniE "ShopeeLeaz|Shopee Leaz|shopeeleaz|SHOPEELEAZ" src prisma README.md package.json .env.example extension || true', { encoding: "utf8", timeout: 25000 });
    expect(output.trim()).toBe("");
  });
});
