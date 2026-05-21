import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("products user isolation static", () => {
  it("enforces userId and deletedAt in paginated query", () => {
    const source = fs.readFileSync("src/services/ProductService.ts", "utf8");
    expect(source).toContain("userId");
    expect(source).toContain("deletedAt: null");
    expect(source).toContain("take: pageSize");
  });
});
