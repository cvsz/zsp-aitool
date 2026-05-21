import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("csv product import progress api static", () => {
  it("has id route and action routes", () => {
    expect(readFileSync("src/app/api/imports/csv-products/[id]/route.ts", "utf8")).toContain("CsvProductImportJobService.get");
    expect(readFileSync("src/app/api/imports/csv-products/[id]/cancel/route.ts", "utf8")).toContain("CsvProductImportJobService.cancel");
    expect(readFileSync("src/app/api/imports/csv-products/[id]/retry/route.ts", "utf8")).toContain("CsvProductImportJobService.retry");
  });

  it("routes are auth protected", () => {
    expect(readFileSync("src/app/api/imports/csv-products/route.ts", "utf8")).toContain("withAuth");
    expect(readFileSync("src/app/api/imports/csv-products/[id]/route.ts", "utf8")).toContain("withAuth");
  });
});
