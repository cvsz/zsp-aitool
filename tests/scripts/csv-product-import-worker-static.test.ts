import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("csv import worker static", () => {
  it("uses streaming primitives", () => {
    const file = readFileSync("scripts/imports/csv-product-import-worker.ts", "utf8");
    expect(file).toContain("createReadStream");
    expect(file).toContain("readline.createInterface");
  });
});
