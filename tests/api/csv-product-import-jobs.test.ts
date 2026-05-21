import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("csv product import job routes", () => {
  it("has auth wrapper", () => {
    const file = readFileSync("src/app/api/imports/csv-products/route.ts", "utf8");
    expect(file).toContain("withAuth");
  });
});
