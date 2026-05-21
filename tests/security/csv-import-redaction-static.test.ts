import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("csv import redaction", () => {
  it("does not expose sourceFilePath in route response", () => {
    const file = readFileSync("src/app/api/imports/csv-products/route.ts", "utf8");
    expect(file).toContain("sourceFilePath: undefined");
  });
});
