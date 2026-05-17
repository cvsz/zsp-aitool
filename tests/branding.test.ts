import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("branding", () => {
  it("does not include deprecated product branding in product code paths", () => {
    const output = execSync('grep -RniE "ShopeeLeaz|Shopee Leaz|shopeeleaz|SHOPEELEAZ" src prisma README.md package.json .env.example extension || true', { encoding: "utf8" });
    expect(output.trim()).toBe("");
  });
});
