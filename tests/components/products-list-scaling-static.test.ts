import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("products list scaling static", () => {
  it("contains empty state copy", () => {
    const source = fs.readFileSync("src/components/products/ProductGrid.tsx", "utf8");
    expect(source).toContain("ยังไม่มีสินค้าในคลัง");
  });
});
